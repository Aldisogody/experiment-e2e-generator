# @sogody/experiment-e2e-generator

A CLI tool to scaffold Playwright E2E testing infrastructure for Experiment Framework projects. Generate a complete test setup with configuration and sample tests in seconds.

## Features

- Complete Playwright setup with multi-browser configuration
- Multi-market support (select a market group like SEBN and get tests for all its countries)
- A/B testing structure with control and experiment variant verification
- Auto-detection of experiment name from `package.json` or `src/components`
- Safe `package.json` merging (preserves existing dependencies and scripts)
- Automatic Playwright installation after generation

## Installation & Usage

No installation required:

```bash
npx experiment-e2e-generator
```

### Requirements

- Node.js >= 16.15.1 (18+ recommended for Playwright 1.40+)
- Existing `package.json` in project root

## What It Generates

```
your-project/
├── playwright.config.js            # Multi-browser config (Chromium, Firefox, WebKit)
├── tests/
│   ├── config/
│   │   ├── experiment.config.js    # Experiment name, market group, timeouts, Adobe Target
│   │   └── qa-links.config.js      # Per-market control/experiment URLs with env var support
│   └── e2e/
│       └── your-experiment/
│           ├── your-experiment.spec.js   # Live URL tests (control vs experiment, all markets)
│           └── experiment-test.spec.js   # Bundle smoke test (loads built JS into blank page)
└── package.json                    # Updated with Playwright dependencies and test scripts
```

## Interactive Setup

The generator prompts for:

1. **Experiment Name** - auto-detected from `package.json` name or first `src/components` entry
2. **Base URL** - e.g., `https://www.samsung.com`
3. **Market or Market Group** - searchable autocomplete with 30+ markets. Selecting a group (e.g., `SEBN`) auto-expands to its countries (BE, BE_FR, NL)
4. **Run ESLint on tests?** - if No, appends `tests/` to `.eslintignore` (when the file exists)

After generation, you're asked whether to run a build + smoke test immediately.

### Example Session

```bash
$ npx experiment-e2e-generator

🎭 Experiment E2E Test Generator

Running pre-flight checks...

Please provide the following information:

? What is your experiment name? › My Awesome Experiment
? Base URL for tests › https://www.samsung.com
? Select market or market group (type to search) › SEBN - Benelux (BE, BE_FR, NL)
? Run ESLint on tests? › No

  Selected markets: BE, BE_FR, NL

📁 Generating test files...

  ✓ playwright.config.js
  ✓ tests/config/experiment.config.js
  ✓ tests/config/qa-links.config.js
  ✓ tests/e2e/my-awesome-experiment/my-awesome-experiment.spec.js
  ✓ tests/e2e/my-awesome-experiment/experiment-test.spec.js
  ✓ Added tests/ to .eslintignore
  ✓ Added test output dirs to .gitignore

📦 Updating package.json...

  ✓ Added Playwright dependencies to devDependencies
  ✓ Added "test:e2e" script
  ✓ Added "test:e2e:experiment" script

📥 Installing Playwright...

  ✓ Playwright installed

✓ Test structure generated successfully!

? Do you want to run tests now? › No
```

## After Generation

### 1. Configure Test URLs

Update the URLs in `tests/config/qa-links.config.js`. The generated config uses per-market URL resolution:

```javascript
// URLs are resolved per market via qaLinksConfig.getUrls(marketCode)
// Default pattern: {baseUrl}/{urlPath}/control-page/ and {baseUrl}/{urlPath}/experiment-page/

// Override with environment variables per market:
//   CONTROL_URL_NL=https://www.samsung.com/nl/my-control-page/
//   EXPERIMENT_URL_NL=https://www.samsung.com/nl/my-experiment-page/

// Or edit the fallback URL pattern directly in qa-links.config.js
```

### 2. Customize Test Selectors

Edit `tests/e2e/your-experiment/your-experiment.spec.js` and replace the placeholder selectors:

```javascript
// Replace this:
const experimentComponent = page.locator('[data-experiment="your-experiment"]');

// With your actual experiment component selector:
const experimentComponent = page.getByRole('banner', { name: 'Promo Offer' });
```

Also edit `experiment-test.spec.js` to update the bundle path and add assertions for your experiment's rendered output.

### 3. Run Tests

```bash
# Bundle smoke test (loads built JS, no URLs needed)
# Requires: yarn build first
yarn test:e2e:experiment

# All e2e tests (requires URLs configured in qa-links.config.js)
yarn test:e2e

# Headed mode / specific file / UI mode
yarn playwright test --headed
yarn playwright test tests/e2e/your-experiment
yarn playwright test --ui
```

## Environment Variables

Per-market environment variables override the default URL pattern:

```bash
# Per-market URLs (replace NL with your market code)
export CONTROL_URL_NL=https://www.samsung.com/nl/control-page/
export EXPERIMENT_URL_NL=https://www.samsung.com/nl/experiment-page/

# For multi-market groups, set each market separately:
export CONTROL_URL_BE=https://www.samsung.com/be/control-page/
export CONTROL_URL_BE_FR=https://www.samsung.com/be_fr/control-page/

# Adobe Target preview token (if applicable)
export ADOBE_PREVIEW_TOKEN=your-token-here

# Test environment
export TEST_ENV=qa
```

## Testing Strategy

Generated tests follow the A/B testing pattern:

- **Control group** (`test.describe('... - Control')`) - verify the experiment component does NOT appear on the control URL
- **Experiment group** (`test.describe('... - Experiment')`) - verify the component appears and functions correctly on the experiment URL
- URLs are resolved per market from `qa-links.config.js`

## Package.json Updates

The generator safely merges into your existing `package.json`:

```json
{
  "devDependencies": {
    "@playwright/test": "1.40.0",
    "playwright": "1.40.0"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:experiment": "playwright test tests/e2e/*/experiment-test.spec.js"
  }
}
```

Existing dependencies and scripts are preserved.

## Troubleshooting

### Tests directory already exists

The generator warns you and asks for confirmation before overwriting.

### Package.json not found

Run the generator from your project root:

```bash
cd your-project
npx experiment-e2e-generator
```

### Playwright installation fails

```bash
yarn add -D @playwright/test playwright
yarn playwright install
```

## Running Tests in CI/CD

The generated `playwright.config.js` is CI-ready. Example GitHub Actions workflow:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install --frozen-lockfile
      - run: yarn playwright install --with-deps
      - run: yarn test:e2e
        env:
          CONTROL_URL_NL: ${{ secrets.CONTROL_URL_NL }}
          EXPERIMENT_URL_NL: ${{ secrets.EXPERIMENT_URL_NL }}
```

## Documentation & Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Samsung Design System](https://design.samsung.com/)

## Support & Contributing

For issues, questions, or contributions, please contact [aldikrasniqi5@gmail.com](mailto:aldikrasniqi5@gmail.com).

## License

MIT
