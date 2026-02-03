# @sogody/experiment-e2e-generator

A CLI tool to scaffold Playwright E2E testing infrastructure for Experiment Framework projects. Generate a complete test setup with configuration, fixtures, utilities, and sample tests in seconds.

## Features

- 🎭 **Complete Playwright Setup** - Generates all necessary configuration and structure
- 📁 **Organized Structure** - Tests, configs, fixtures, and utilities properly organized
- 🔧 **Smart Configuration** - Auto-detects project settings and experiment names
- ✨ **Template System** - Customizable templates with placeholder replacement
- 📦 **Safe Updates** - Merges dependencies without overwriting existing `package.json`
- 🎯 **Best Practices** - Follows Playwright and A/B testing best practices

## Installation & Usage

No installation required! Use `npx` to run directly:

```bash
npx experiment-e2e-generator
```

### Requirements

- Node.js >= 16.15.1 (18+ recommended for Playwright 1.40+)
- Existing `package.json` in project root
- Project must be an Experiment Framework project

## What It Generates

Running the generator creates the following structure:

```
your-project/
├── playwright.config.js          # Playwright configuration
├── tests/
│   ├── config/
│   │   ├── index.js             # Central config export
│   │   ├── experiment.config.js # Experiment-specific settings
│   │   └── qa-links.config.js   # Test URLs (control & experiment)
│   ├── e2e/
│   │   └── your-experiment/
│   │       ├── your-experiment.spec.js  # Live URL tests (control vs experiment)
│   │       └── experiment-test.spec.js   # Bundle/component test (optional)
│   ├── fixtures/
│   │   └── test-fixtures.js     # Custom test fixtures
│   └── utils/
│       └── test-helpers.js      # Reusable helper functions
└── package.json                 # Updated with Playwright dependencies
```

## Interactive Setup

The generator will prompt you for:

1. **Experiment Name** - Your experiment's name (auto-detected from `package.json` or `src/components` if possible)
2. **Base URL** - The base URL for tests (e.g., `https://www.samsung.com`)
3. **Market Code** - Primary market (e.g., `NL`, `BE`, `US`)
4. **Run ESLint on tests?** - If **No**, the generator adds `tests/` to `.eslintignore` (when that file exists)
5. **Do you want to run tests now?** - After generation, optionally runs `yarn build` (if a `build` script exists) and `yarn test:e2e:experiment` (experiment smoke test only; or npm equivalent)

### Example Session

```bash
$ npx experiment-e2e-generator

🎭 Experiment E2E Test Generator

Running pre-flight checks...

Please provide the following information:

? What is your experiment name? › My Awesome Experiment
? Base URL for tests › https://www.samsung.com
? Primary market code › NL
? Do you want to run ESLint on tests? › No

📁 Generating test files...

  ✓ playwright.config.js
  ✓ tests/config/index.js
  ✓ tests/config/experiment.config.js
  ✓ tests/config/qa-links.config.js
  ✓ tests/fixtures/test-fixtures.js
  ✓ tests/utils/test-helpers.js
  ✓ tests/e2e/my-awesome-experiment/my-awesome-experiment.spec.js
  ✓ tests/e2e/my-awesome-experiment/experiment-test.spec.js
  ✓ Added tests/ to .eslintignore

📦 Updating package.json...

  ✓ Added Playwright dependencies to devDependencies
  ✓ Added "test:e2e" script
  ✓ Added "test:e2e:experiment" script

📥 Installing Playwright...

  ✓ Playwright installed

✓ Test structure generated successfully!

Next steps:
  1. Update test URLs in: tests/config/qa-links.config.js
  2. Customize test selectors in: tests/e2e/my-awesome-experiment/...
  3. Run tests: yarn test:e2e:experiment (experiment smoke) or yarn test:e2e (all e2e, after configuring URLs)

? Do you want to run tests now? › No
```

## After Generation

### 1. Install Dependencies

```bash
yarn install
```

Or with npm:

```bash
npm install
```

### 2. Configure Test URLs

Update the URLs in `tests/config/qa-links.config.js`:

```javascript
export const qaLinksConfig = {
  controlUrl: process.env.CONTROL_URL || 'https://www.samsung.com/nl/control-page/',
  experimentUrl: process.env.EXPERIMENT_URL || 'https://www.samsung.com/nl/experiment-page/',
};
```

You can set these via environment variables or update them directly in the file.

### 3. Customize Test Selectors

Edit your test file at `tests/e2e/your-experiment/your-experiment.spec.js`:

```javascript
// Update selectors to match your experiment component
const experimentComponent = page.locator('[data-experiment="your-experiment"]');
```

### 4. Run Tests

- **`test:e2e:experiment`** – Runs only `experiment-test.spec.js` (bundle smoke test; no URLs required). Use this right after generation or when you only want to verify the built bundle.
- **`test:e2e`** – Runs all e2e tests (including `your-experiment.spec.js`; requires URLs and selectors configured in `tests/config/qa-links.config.js`).

```bash
# Run experiment smoke test (bundle only; no URLs)
yarn test:e2e:experiment

# Run all e2e tests (after configuring URLs)
yarn test:e2e

# Run in headed mode
yarn playwright test --headed

# Run specific test file
yarn playwright test tests/e2e/your-experiment

# Run with UI mode
yarn playwright test --ui
```

## Generated Files Overview

### `playwright.config.js`

Main Playwright configuration with:
- Multi-browser support (Chromium, Firefox, WebKit)
- HTML reporter
- Screenshot and trace on failure
- Optimized for CI/CD

### `tests/config/experiment.config.js`

Experiment-specific settings:
- Experiment name and market
- Timeout configurations
- Environment variables
- Adobe Target integration (if needed)

### `tests/config/qa-links.config.js`

Test URL management:
- Control and experiment URLs
- URL validation
- Environment variable support

### `tests/e2e/your-experiment/your-experiment.spec.js`

Live-URL test suite with:
- **Control tests** - Verify experiment doesn't appear on control URL
- **Experiment tests** - Verify experiment appears and functions on experiment URL
- Uses `tests/config/qa-links.config.js` for control/experiment URLs
- Proper test structure following best practices

### `tests/e2e/your-experiment/experiment-test.spec.js`

Optional bundle/component test that:
- Loads your built bundle (e.g. `dist/v1-index.jsx`) and injects it into a blank page
- Tests a sample button component (visibility, label, counter, screenshot)
- Requires `yarn build` (or equivalent) before running e2e
- Customize selectors and bundle path for your experiment

### `tests/fixtures/test-fixtures.js`

Custom Playwright fixtures:
- Experiment context with utilities
- Adobe Target preview support
- URL building helpers

### `tests/utils/test-helpers.js`

Reusable helper functions:
- Network idle waiting
- Element stability checks
- Viewport utilities
- Screenshot helpers
- Retry with backoff

## Testing Strategy

The generated tests follow A/B testing best practices:

### Control Group Tests
Verify that the experiment component **does not appear** in the control variant:

```javascript
test.describe('Your Experiment - Control', () => {
  test('should not display experiment component', async ({ page }) => {
    await page.goto(qaLinksConfig.controlUrl);
    await expect(experimentComponent).not.toBeVisible();
  });
});
```

### Experiment Group Tests
Verify that the experiment component **appears and functions correctly**:

```javascript
test.describe('Your Experiment - Experiment', () => {
  test('should display experiment component', async ({ page }) => {
    await page.goto(qaLinksConfig.experimentUrl);
    await expect(experimentComponent).toBeVisible();
  });
  
  test('should handle user interactions correctly', async ({ page }) => {
    await page.goto(qaLinksConfig.experimentUrl);
    // Test interactions...
  });
});
```

## Environment Variables

You can use environment variables for dynamic configuration:

```bash
# Set test URLs
export CONTROL_URL=https://www.samsung.com/nl/control
export EXPERIMENT_URL=https://www.samsung.com/nl/experiment

# Set Adobe Target preview token (if applicable)
export ADOBE_PREVIEW_TOKEN=your-token-here

# Set test environment
export TEST_ENV=qa

# Run tests
yarn test:e2e
```

## Best Practices

### Locator Strategy

The generated tests follow Playwright's recommended locator hierarchy:

1. **getByRole** - Preferred for accessibility
2. **getByText** - For visible text content
3. **getByLabel** - For form fields
4. **data attributes** - Only when necessary

### Test Structure

- Use `test.describe` blocks for logical grouping
- Keep tests independent and isolated
- Use `test.beforeEach` for common setup
- Avoid sharing state between tests

### Assertions

- Use web-first assertions that auto-wait
- Prefer `toBeVisible()` over checking element existence
- Use `toHaveText()` instead of `textContent()`

## Troubleshooting

### Tests directory already exists

If you see a warning about existing tests, the generator will ask for confirmation before overwriting. Make sure to back up any important test files first.

### Package.json not found

The generator must be run from your project root where `package.json` exists. Navigate to your project directory first:

```bash
cd your-project
npx experiment-e2e-generator
```

### Playwright installation fails

If Playwright installation fails, try manually installing:

```bash
yarn add -D @playwright/test playwright
yarn playwright install
```

## Advanced Usage

### Custom Test URLs per Environment

Use a `.env` file (add it to `.gitignore`):

```env
# .env
TEST_ENV=staging
CONTROL_URL=https://staging.samsung.com/nl/control
EXPERIMENT_URL=https://staging.samsung.com/nl/experiment
```

Then use a package like `dotenv`:

```bash
yarn add -D dotenv
```

### Running Tests in CI/CD

The generated `playwright.config.js` is CI-ready with:
- Automatic retry on failure
- Single worker for stability
- Built-in reporters

Example GitHub Actions workflow:

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
          CONTROL_URL: ${{ secrets.CONTROL_URL }}
          EXPERIMENT_URL: ${{ secrets.EXPERIMENT_URL }}
```

## Post-Generation Behavior

- **Playwright install** – If `package.json` was updated, the generator runs `yarn install` or `npm install` (detected from `yarn.lock` / `package-lock.json`) in your project to install Playwright.
- **ESLint** – If you chose not to run ESLint on tests and your project has a `.eslintignore` file, the generator appends `tests/` to it.
- **Run tests now** – You can choose to run `build` (if defined) and `test:e2e:experiment` (experiment smoke test only) immediately after generation.

## Package.json Updates

The generator safely updates your `package.json`:

### Added Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "1.40.0",
    "playwright": "1.40.0"
  }
}
```

### Added Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:experiment": "playwright test tests/e2e/*/experiment-test.spec.js"
  }
}
```

Existing dependencies and scripts are preserved.

## Documentation & Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Samsung Design System](https://design.samsung.com/)

## Support & Contributing

For issues, questions, or contributions, please contact me at [aldikrasniqi5@gmail.com](mailto:aldikrasniqi5@gmail.com)

## License

MIT

---

**Made with ❤️ by Aldi **
