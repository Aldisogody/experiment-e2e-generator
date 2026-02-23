---
name: experiment-e2e-generator-patterns
description: Coding patterns extracted from the experiment-e2e-generator CLI tool
version: 1.0.0
source: local-git-analysis
analyzed_commits: 35
---

# Experiment E2E Generator Patterns

## Commit Conventions

This project uses **conventional commits** consistently:

| Prefix | Purpose |
|--------|---------|
| `feat:` | New features or significant additions |
| `fix:` | Bug fixes (template bugs, API references, path corrections) |
| `chore:` | Maintenance (CHANGELOG, README, .gitignore, version bumps) |
| `ci:` | GitHub Actions workflow changes |
| `refactor:` | Code reorganisation without behaviour change |
| `docs:` | Documentation-only changes |

Version bumps get their own standalone commit: `v1.0.x`.

## Code Architecture

```
bin/
└── cli.js                  # Entry point — calls generator()
src/
├── generator.js            # Main pipeline orchestration (6-step flow)
├── prompts.js              # Interactive CLI via `prompts` library
├── file-operations.js      # Template copy, fileMappings, .eslintignore/.gitignore helpers
├── package-updater.js      # package.json merging, spawnSync for install/build/test
├── utils.js                # Pure utilities (toKebabCase, replaceTemplateVars, mergePackageJson, …)
└── markets.js              # MARKET_GROUPS constant, resolveMarkets(), getMarketChoices()
templates/
├── playwright.config.js
└── tests/
    ├── config/             # experiment.config.js, qa-links.config.js, index.js
    ├── e2e/experiment-name/  # experiment.spec.js, experiment-test.spec.js
    ├── fixtures/           # test-fixtures.js
    └── utils/              # test-helpers.js
tests/
├── utils.test.js
├── markets.test.js
└── package-updater.test.js
```

## Module Responsibilities

One file, one concern. Never put business logic in the entry point:

- **generator.js** — orchestration only: calls other modules in order, handles user-facing console output with `chalk`
- **utils.js** — pure functions with no side effects (string transforms, JSON merge, file copy)
- **markets.js** — pure data + pure functions; `MARKET_GROUPS` is a frozen constant
- **file-operations.js** — filesystem side effects only; delegates string work to `utils.js`
- **package-updater.js** — process/spawn side effects only (install, build, test runs)

## File Co-Change Workflows

### Adding or Changing a Feature

Files that change together:
1. `src/generator.js` + `src/file-operations.js` — pipeline steps and file generation
2. Template files (`templates/tests/config/*.js`, `templates/tests/e2e/**`) — always update in concert
3. `README.md` + `CHANGELOG.md` + `CONTRIBUTING.md` — docs updated with every feature commit

### Adding a New Template File

1. Create file in `templates/`
2. Add entry to `fileMappings` array in `file-operations.js`
3. Add entry to `getGeneratedFilesList()` in `file-operations.js`
4. Use `{{VARIABLE_NAME}}` placeholders — all go through `copyTemplateFile` → `replaceTemplateVars`

### Releasing a Version

```bash
yarn version --patch   # bumps package.json
# Commit message: "v1.0.x"
yarn publish --access public
```

## Key Patterns

### Template Variable Substitution

```js
// Pattern: {{UPPER_SNAKE_CASE}} placeholders replaced via replaceTemplateVars()
const variables = {
  EXPERIMENT_NAME: experimentName,
  EXPERIMENT_NAME_KEBAB: experimentNameKebab,
  BASE_URL: baseUrl,
  MARKET_GROUP: marketGroup,
  MARKETS_JSON: JSON.stringify(markets),
};
```

### Immutable Object Updates

```js
// CORRECT — always return new object, never mutate
export function mergePackageJson(existing, additions) {
  const merged = { ...existing };
  if (additions.devDependencies) {
    merged.devDependencies = { ...merged.devDependencies, ...additions.devDependencies };
  }
  return merged;
}
```

### Result Objects (not throws) for Validation

```js
// Return {isValid, error?} — callers decide whether to exit
return { isValid: false, error: 'No package.json found…' };
return { isValid: true };

// Side-effecting helpers return {updated: boolean}
return { updated: false };
return { updated: true };
```

### Market Resolution Pattern

```js
// resolveMarkets() accepts group codes ("SEBN"), country codes ("NL"), or custom strings
// Always returns { marketGroup: string, markets: Array<{code, urlPath, name}> }
const { marketGroup, markets } = resolveMarkets(userInput);
```

## Testing Patterns

### Framework

Node built-in test runner — no external test dependencies:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
```

Run with: `node --test tests/*.test.js` (mapped to `yarn test`).

### Test File Naming

One test file per source module: `utils.test.js`, `markets.test.js`, `package-updater.test.js`.

### Filesystem Tests — Temp Directory Pattern

```js
import os from 'os';
import fs from 'fs-extra';

it('validates a project directory', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-test-'));
  try {
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
    const result = await validateProjectDirectory(tmpDir);
    assert.equal(result.isValid, true);
  } finally {
    await fs.remove(tmpDir);  // always clean up
  }
});
```

### Immutability Assertion

```js
// Always verify the original was not mutated
assert.notEqual(result, existing);
assert.equal(existing.devDependencies['playwright'], undefined);
```

### Edge Cases to Always Cover

- Empty string / whitespace-only inputs
- Already-present entries (idempotency)
- Missing optional files (`.eslintignore` may not exist)
- Scoped npm package names (`@scope/name` → strip prefix)

## A/B Testing Pattern in Generated Tests

All generated Playwright specs follow this structure:

```js
test.describe('Control group', () => {
  // Verify experiment component does NOT appear
  await expect(component).not.toBeVisible();
});

test.describe('Experiment group', () => {
  // Verify component appears and functions correctly
  await expect(component).toBeVisible();
});
```

URL-based variant switching via `qa-links.config.js`:
- `CONTROL_URL_<MARKET_CODE>` env var → control URL
- `EXPERIMENT_URL_<MARKET_CODE>` env var → experiment URL

## Locator Priority (Generated Tests)

1. `getByRole` — semantic and accessible
2. `getByText` / `getByLabel`
3. Data attributes
4. Never: fragile CSS class selectors

Use web-first assertions (`toBeVisible()`, `toHaveText()`) — never manual waits.

## Dependencies (Minimal by Design)

Only three runtime deps for an `npx` tool:
- `chalk` — terminal colours
- `fs-extra` — file operations
- `prompts` — interactive CLI prompts
