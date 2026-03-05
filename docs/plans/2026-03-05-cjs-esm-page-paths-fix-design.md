# Design: Dual CJS/ESM Export for `page-paths`

**Date:** 2026-03-05
**Status:** Approved

## Problem

`experiment-e2e-generator` is an ES Module package (`"type": "module"`). The `./page-paths` subpath export (`src/page-paths.js`) is therefore ESM-only. Target experiment projects do not have `"type": "module"` in their `package.json`, so their `.js` files are loaded as CommonJS. When Playwright loads a generated test file it transitively `require()`s `page-paths.config.js`, which in turn tries to load `experiment-e2e-generator/page-paths` — this fails with:

```
Error: require() of ES Module .../experiment-e2e-generator/src/page-paths.js not supported.
```

## Solution: Dual CJS/ESM Export (Option A)

Add a CommonJS shim alongside the existing ESM source and wire both up via conditional `exports`. Node automatically selects the correct entry based on the caller's module type.

## What Changes

### 1. New file: `src/page-paths.cjs`

A CommonJS mirror of `src/page-paths.js` that exports all named exports via `module.exports`:

- `PAGE_PATH_CHOICES`
- `getPagePathPromptChoices`
- `pfp`
- `pcd`
- `pdp`
- `buy`

### 2. `package.json` exports update

```json
"./page-paths": {
  "import": "./src/page-paths.js",
  "require": "./src/page-paths.cjs"
}
```

### 3. Unit test for parity

A test asserts that the exported keys from `page-paths.cjs` match those from `page-paths.js`, preventing silent drift.

## What Does NOT Change

- All templates remain unchanged
- Generator pipeline is untouched
- Target project `package.json` is untouched
- All other `exports` entries are untouched
- The `.cjs` file is already covered by the `"src"` entry in `files`

## Fix Scope

Generator-side only. Existing generated projects benefit immediately after `npm update experiment-e2e-generator` — no re-run required.
