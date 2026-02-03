# Contributing to @sogody/experiment-e2e-generator

Thank you for your interest in contributing to this project!

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd experiment-e2e-generator
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Link the package locally for testing:
   ```bash
   yarn link
   ```

## Testing Locally

After linking, you can test the generator in any project:

```bash
cd /path/to/test-project
npx experiment-e2e-generator
```

Or use the linked version:

```bash
experiment-e2e-generator
```

## Project Structure

```
experiment-e2e-generator/
├── bin/
│   └── cli.js                  # CLI entry point
├── src/
│   ├── generator.js            # Main orchestration (pre-flight, prompts, generate, package update, install, optional run tests)
│   ├── prompts.js              # User input (experiment name, base URL, market, run ESLint on tests)
│   ├── file-operations.js      # Template copy + variable replacement, tests dir check, getGeneratedFilesList, addTestsToEslintIgnore
│   ├── package-updater.js      # package.json merge, isPlaywrightInstalled, detectPackageManager, installDependencies, runBuildAndTests
│   └── utils.js                # toKebabCase, replaceTemplateVars, pathExists, mergePackageJson, detectExperimentName, validateProjectDirectory, copyTemplateFile
├── templates/
│   ├── playwright.config.js
│   └── tests/
│       ├── config/             # index.js, experiment.config.js, qa-links.config.js
│       ├── e2e/experiment-name/
│       │   ├── experiment.spec.js   # Live URL control/experiment tests
│       │   └── basic-test.spec.js   # Bundle/component test
│       ├── fixtures/test-fixtures.js
│       └── utils/test-helpers.js
├── package.json
└── README.md
```

## Making Changes

### Adding New Templates

1. Create the template file in `templates/` directory
2. Use `{{VARIABLE_NAME}}` for placeholders (where applicable)
3. Add the mapping in `file-operations.js` (in `fileMappings` and in `getGeneratedFilesList` if it should be listed in the CLI output)
4. Update `README.md` with information about the new file

Available template variables:
- `{{EXPERIMENT_NAME}}` - Original experiment name
- `{{EXPERIMENT_NAME_KEBAB}}` - Kebab-case version
- `{{BASE_URL}}` - Base URL for tests
- `{{MARKET}}` - Market code (uppercase)

Note: `basic-test.spec.js` does not use these variables; it is a static template for bundle/component tests.

### Modifying Prompts

Edit `src/prompts.js` to add or modify user prompts. Each prompt should:
- Have a descriptive `message`
- Include `initial` value when possible
- Validate user input with `validate` function

### Updating Dependencies

When updating Playwright or other dependencies:
1. Update version in `src/package-updater.js`
2. Update version in `package.json`
3. Test with multiple project types
4. Update documentation if needed

## Code Style

- Use ES modules (`import/export`)
- Use async/await for asynchronous operations
- Add JSDoc comments for all functions
- Use descriptive variable names
- Keep functions focused and single-purpose

## Testing Changes

Before submitting a pull request:

1. Test in a fresh project:
   ```bash
   mkdir test-project
   cd test-project
   yarn init -y
   npx @sogody/experiment-e2e-generator
   ```

2. Verify generated files:
   - All files created correctly
   - Template variables replaced
   - package.json updated properly

3. Test with edge cases:
   - Existing tests directory
   - Playwright already installed
   - Special characters in experiment name
   - Canceling prompts mid-flow
   - ESLint on tests: Yes vs No (check .eslintignore when it exists)
   - "Do you want to run tests now?" (build + test:e2e when applicable)

4. Run generated tests:
   ```bash
   yarn install
   yarn test:e2e
   ```

## Commit Message Format

Use clear, descriptive commit messages:

```
feat: Add support for custom test directory
fix: Correct template variable replacement in config
docs: Update installation instructions
refactor: Simplify file generation logic
```

## Publishing New Versions

For maintainers only:

1. Update version in `package.json`:
   ```bash
   yarn version --patch  # or --minor, --major
   ```

2. Update CHANGELOG if exists

3. Publish to npm:
   ```bash
   yarn publish --access public
   ```

4. Create GitHub release with tag

## Questions?

Contact the Sogody team for any questions or clarifications.
