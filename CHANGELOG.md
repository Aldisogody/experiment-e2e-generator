# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_(No changes yet.)_

## [1.0.5] - 2026-02-03

### Added
- `experiment-test.spec.js` – Bundle/component test template that loads the built bundle and tests a sample button (visibility, counter, screenshot)
- Prompt: "Do you want to run ESLint on tests?" – when No, adds `tests/` to `.eslintignore` if that file exists
- Optional "Do you want to run tests now?" – runs `build` (if present) then `test:e2e` after generation
- Automatic Playwright install – after updating package.json, runs `yarn install` or `npm install` in the target project
- Package manager detection (yarn vs npm) for install and run commands

### Changed
- Generated file list now includes `experiment-test.spec.js` and optional "Added tests/ to .eslintignore" in CLI output

## [1.0.0] - 2026-02-02

### Added
- Initial release of experiment-e2e-generator
- Interactive CLI for generating Playwright E2E test infrastructure
- Complete template system with placeholder replacement
- Auto-detection of experiment names from project structure (`package.json` name or first `src/components` entry)
- Safe package.json updating (preserves existing configuration)
- Generated test structure includes:
  - `playwright.config.js` - Multi-browser configuration
  - `tests/config/` - Experiment and URL configuration files
  - `tests/e2e/<experiment>/` - `experiment.spec.js` (live URL control/experiment tests)
  - `tests/fixtures/` - Custom Playwright fixtures
  - `tests/utils/` - Reusable helper functions
- Pre-flight validation checks
- Warning system for existing test directories
- Comprehensive documentation and examples
- Support for environment variables (CONTROL_URL, EXPERIMENT_URL, etc.)
- Adobe Target preview token integration
- Organized folder structure following best practices

### Template Variables
- `{{EXPERIMENT_NAME}}` - Original experiment name
- `{{EXPERIMENT_NAME_KEBAB}}` - Kebab-case formatted name
- `{{BASE_URL}}` - Base URL for tests
- `{{MARKET}}` - Market code (uppercase)

### Dependencies
- chalk ^5.6.2 - Terminal styling
- fs-extra ^11.3.3 - File system utilities
- prompts ^2.4.2 - Interactive CLI prompts

### Requirements
- Node.js >= 16.15.1
- Existing package.json in project root

[Unreleased]: https://github.com/sogody/experiment-e2e-generator/compare/v1.0.5...HEAD
[1.0.5]: https://github.com/sogody/experiment-e2e-generator/releases/tag/v1.0.5
[1.0.0]: https://github.com/sogody/experiment-e2e-generator/releases/tag/v1.0.0
