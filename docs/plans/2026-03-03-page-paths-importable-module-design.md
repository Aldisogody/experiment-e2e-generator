# Design: Page Paths as Importable Module

**Date:** 2026-03-03
**Status:** Approved

## Problem

Currently, developers must select page paths interactively during `npx experiment-e2e-generator`. The selection is then baked into the generated `tests/config/page-paths.config.js` as a static JS object literal. This has two drawbacks:

1. No discoverability — developers cannot see what other paths exist without re-running the generator.
2. No programmatic control — updating paths requires manually editing a generated string.

## Goal

Expose `src/page-paths.js` as a public subpath export (`experiment-e2e-generator/page-paths`) so that the generated `page-paths.config.js` imports live path groups from the module. Developers configure paths by editing a single import statement rather than re-running the CLI.

## Approach: Two-Level Grouped Exports (type → category)

### New exports in `src/page-paths.js`

Four named exports, each a two-level object (page type → product category):

```js
export const pfp = {
  smartphones:   { pfpSmartphonesAll: '/smartphones/all-smartphones/', ... },
  tablets:       { pfpTabletsAll: '/tablets/all-tablets/', ... },
  computers:     { pfpComputersAll: '/computers/all-computers/', ... },
  monitors:      { pfpMonitorsAll: '/monitors/all-monitors/', ... },
  watches:       { pfpWatchesAll: '/watches/all-watches/', ... },
  tvs:           { pfpTvsAll: '/tvs/all-tvs/', pfpTvsNeoQled: '...', ... },
  lifestyleTvs:  { pfpLifestyleTheFrame: '/lifestyle-tvs/the-frame/', ... },
  audio:         { pfpAudioAll: '/audio-devices/all-audio-devices/' },
  refrigerators: { pfpRefrigeratorsAll: '...', pfpRefrigSmart: '...', ... },
  washers:       { pfpWashersAll: '...', pfpWashingMachines: '...', ... },
  cooking:       { pfpCookingAll: '...', pfpCookingOvens: '...', ... },
  dishwashers:   { pfpDishwashersAll: '/dishwashers/all-dishwashers/' },
  vacuums:       { pfpVacuumAll: '/vacuum-cleaners/all-vacuum-cleaners/' },
};

export const pcd = {
  smartphones:  { pcdSmartphones: '/smartphones/' },
  tablets:      { pcdTablets: '/tablets/' },
  computers:    { pcdComputers: '/computers/' },
  monitors:     { pcdMonitors: '/monitors/' },
  watches:      { pcdWatches: '/watches/' },
  tvs:          { pcdTvs: '/tvs/' },
  lifestyleTvs: { pcdLifestyleTvs: '/lifestyle-tvs/' },
  audio:        { pcdAudio: '/audio-devices/' },
  projectors:   { pcdProjectors: '/projectors/' },
  refrigerators:{ pcdRefrigerators: '/refrigerators/' },
  washers:      { pcdWashers: '/washers-and-dryers/' },
  cooking:      { pcdCooking: '/cooking-appliances/' },
  dishwashers:  { pcdDishwashers: '/dishwashers/' },
  vacuums:      { pcdVacuum: '/vacuum-cleaners/' },
};

export const pdp = {
  galaxyZFold: { pdpGalaxyZFold7: '...', pdpGalaxyZFold6: '...' },
  galaxyZFlip: { pdpGalaxyZFlip7: '...', pdpGalaxyZFlip7Fe: '...', pdpGalaxyZFlip6: '...' },
  galaxyS25:   { pdpGalaxyS25: '...', pdpGalaxyS25Edge: '...', pdpGalaxyS25Ultra: '...' },
  galaxyS24:   { pdpGalaxyS24: '...', pdpGalaxyS24Fe: '...', pdpGalaxyS24Ultra: '...' },
};

export const buy = { /* same shape as pdp, buy/ suffix paths */ };
```

Existing exports are preserved:
- `PAGE_PATH_CHOICES` — flat array, still used by the CLI multiselect prompt
- `getPagePathPromptChoices()` — still used by the CLI prompt
- `buildPagePathsJs()` — **removed** (no longer needed)

### Package subpath export

`package.json` gains an `exports` field:

```json
"exports": {
  ".": "./bin/cli.js",
  "./page-paths": "./src/page-paths.js"
}
```

### Generated `tests/config/page-paths.config.js`

The `{{PAGE_PATHS_JS}}` injection is replaced with a documented static import. Developers edit this file directly:

```js
/**
 * Page paths for {{EXPERIMENT_NAME}} tests.
 *
 * Import the groups your experiment targets. Available groups:
 *   pfp  — pfp.smartphones · pfp.tvs · pfp.tablets · pfp.computers
 *          pfp.monitors · pfp.watches · pfp.audio · pfp.lifestyleTvs
 *          pfp.refrigerators · pfp.washers · pfp.cooking
 *          pfp.dishwashers · pfp.vacuums
 *   pcd  — pcd.smartphones · pcd.tvs · pcd.lifestyleTvs · pcd.audio …
 *   pdp  — pdp.galaxyS25 · pdp.galaxyS24 · pdp.galaxyZFold · pdp.galaxyZFlip
 *   buy  — buy.galaxyS25 · buy.galaxyS24 · buy.galaxyZFold · buy.galaxyZFlip
 */
import { pfp } from 'experiment-e2e-generator/page-paths';

// Adjust to the pages your experiment targets:
export const pagePaths = {
  ...pfp.smartphones,
};
```

### Generator flow changes

- `generator.js`: Remove the `getPagePathSelections()` call and `config.pagePaths` assignment (steps 58–64).
- `file-operations.js`: Remove `PAGE_PATHS_JS` from the template variables map; remove `buildPagePathsJs` import.

### `package-updater.js` — add generator as devDependency

The generated config imports from `experiment-e2e-generator`, so the target project needs it installed. `updatePackageJson()` checks for `experiment-e2e-generator` in devDependencies and includes it in the packages list. The version is read from the generator's own `package.json` at runtime.

## Files Changed

| File | Change |
|---|---|
| `src/page-paths.js` | Add `pfp`, `pcd`, `pdp`, `buy` exports; remove `buildPagePathsJs` |
| `package.json` | Add `exports` field |
| `templates/tests/config/page-paths.config.js` | Replace `{{PAGE_PATHS_JS}}` with static import template |
| `src/generator.js` | Remove page-path prompt step |
| `src/file-operations.js` | Remove `PAGE_PATHS_JS` variable and `buildPagePathsJs` import |
| `src/package-updater.js` | Add generator itself as devDep in target project |

## Developer Experience After Change

```js
// tests/config/page-paths.config.js — edit this after generation
import { pfp, pdp } from 'experiment-e2e-generator/page-paths';

export const pagePaths = {
  ...pfp.smartphones,   // all 4 smartphone PFP paths
  ...pfp.tvs,           // all TV listing paths
  ...pdp.galaxyS25,     // S25, S25 Edge, S25 Ultra PDPs
};
```
