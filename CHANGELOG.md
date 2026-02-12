# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-02-09

### Added
- Unit tests for utils, markets, and package-updater modules using Node.js built-in test runner (60 tests)
- CI validation workflow (GitHub Actions) with Node 18 + 20 matrix
- Module import smoke test in CI pipeline

### Changed
- Added unit testing

## [1.0.12] - 2026-02-09

### Fixed
- Updated Playwright dependency from pinned 1.40.0 to ^1.49.0 range
- Removed unnecessary JSON parsing in multi-market templates
- Resolved multi-market template bugs and broken API references in generated files

## [1.0.11] - 2026-02-04

### Added
- Multi-market support: select a market group (e.g., SEBN) and automatically generate config for all its countries (BE, BE_FR, NL)
- `markets.js` module with `MARKET_GROUPS` constant, `resolveMarkets()`, `getMarketChoices()`, and `formatMarketCodes()`
- Autocomplete market selection prompt with 30+ Samsung markets
- Automatic `.gitignore` updates for test output directories (`playwright-report/`, `coverage/`, `test-results/`)
- New template variables: `{{MARKET_GROUP}}` and `{{MARKETS_JSON}}`

### Changed
- `qa-links.config.js` template now uses per-market URL resolution with `getUrls(marketCode)` and `getAllUrls()` methods
- `experiment.config.js` template now includes full market array and market group code
- Market prompt changed from free-text input to searchable autocomplete

### Fixed
- `confirmAction` prompt now defaults to `true` for better user experience

## [1.0.9] - 2026-02-03

### Fixed
- Corrected `test:e2e:experiment` script path in `package-updater.js` to use `tests/e2e/*/experiment-test.spec.js`

## [1.0.8] - 2026-02-03

### Changed
- Updated CHANGELOG, README, and CONTRIBUTING documentation for v1.0.6 features

## [1.0.7] - 2026-02-03

### Changed
- Updated contact information and author attribution in README

## [1.0.6] - 2026-02-03

### Changed
- Updated CHANGELOG, README, and CONTRIBUTING documentation for v1.0.5 features

## [1.0.5] - 2026-02-03

### Added
- `experiment-test.spec.js` - Bundle/component test template that loads the built bundle and tests it on a blank page
- Prompt: "Do you want to run ESLint on tests?" - when No, adds `tests/` to `.eslintignore` if that file exists
- Optional "Do you want to run tests now?" - runs `build` (if present) then `test:e2e:experiment` after generation
- Automatic Playwright install - after updating package.json, runs `yarn install` or `npm install` in the target project
- Package manager detection (yarn vs npm) for install and run commands

## [1.0.0] - 2026-02-02

### Added
- Initial release of experiment-e2e-generator
- Interactive CLI for generating Playwright E2E test infrastructure
- Complete template system with `{{VARIABLE}}` placeholder replacement
- Auto-detection of experiment names from project structure (`package.json` name or first `src/components` entry)
- Safe package.json updating (preserves existing configuration)
- Generated test structure: `playwright.config.js`, `tests/config/`, `tests/e2e/`
- Pre-flight validation checks
- Warning system for existing test directories
- Support for environment variables (CONTROL_URL, EXPERIMENT_URL, ADOBE_PREVIEW_TOKEN)

### Template Variables
- `{{EXPERIMENT_NAME}}` - Original experiment name
- `{{EXPERIMENT_NAME_KEBAB}}` - Kebab-case formatted name
- `{{BASE_URL}}` - Base URL for tests

### Dependencies
- chalk ^5.6.2 - Terminal styling
- fs-extra ^11.3.3 - File system utilities
- prompts ^2.4.2 - Interactive CLI prompts

[Unreleased]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.12...v1.1.0
[1.0.12]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.9...v1.0.11
[1.0.9]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/Aldisogody/experiment-e2e-generator/compare/v1.0.0...v1.0.5
[1.0.0]: https://github.com/Aldisogody/experiment-e2e-generator/releases/tag/v1.0.0
