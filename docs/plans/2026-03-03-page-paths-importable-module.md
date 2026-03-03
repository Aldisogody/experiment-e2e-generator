# Page Paths Importable Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose `src/page-paths.js` grouped exports (`pfp`, `pcd`, `pdp`, `buy`) as a public subpath import (`experiment-e2e-generator/page-paths`) so the generated `page-paths.config.js` uses a live import instead of baked-in static content.

**Architecture:** Add four named exports to `src/page-paths.js` organized as type → category objects. Expose them via a `./page-paths` subpath in `package.json` `exports`. Update the template and generator pipeline to remove the interactive page-path prompt — developers configure paths by editing the generated import instead.

**Tech Stack:** Node.js ES modules, Node built-in test runner (`node:test`), `fs-extra`, `chalk`, `prompts`

---

### Task 1: Write failing tests for the new grouped exports

**Files:**
- Modify: `tests/page-paths.test.js`

**Step 1: Add failing tests for `pfp`, `pcd`, `pdp`, `buy` exports**

Append these tests to the bottom of `tests/page-paths.test.js` (keep all existing tests intact):

```js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_PATH_CHOICES, getPagePathPromptChoices, pfp, pcd, pdp, buy } from '../src/page-paths.js';

// ── pfp ──────────────────────────────────────────────────────────────────────

describe('pfp grouped export', () => {
  const EXPECTED_CATEGORIES = [
    'smartphones', 'tablets', 'computers', 'monitors', 'watches',
    'tvs', 'lifestyleTvs', 'audio', 'refrigerators', 'washers',
    'cooking', 'dishwashers', 'vacuums',
  ];

  test('pfp is an object with all expected category keys', () => {
    assert.ok(pfp && typeof pfp === 'object');
    for (const cat of EXPECTED_CATEGORIES) {
      assert.ok(cat in pfp, `pfp missing category: ${cat}`);
    }
  });

  test('pfp has no extra keys', () => {
    const actual = Object.keys(pfp).sort();
    assert.deepEqual(actual, [...EXPECTED_CATEGORIES].sort());
  });

  test('every pfp entry value is a string path starting with /', () => {
    for (const [cat, entries] of Object.entries(pfp)) {
      for (const [key, val] of Object.entries(entries)) {
        assert.equal(typeof val, 'string', `pfp.${cat}.${key} is not a string`);
        assert.ok(val.startsWith('/'), `pfp.${cat}.${key} must start with /`);
      }
    }
  });

  test('pfp.smartphones contains pfpSmartphonesAll', () => {
    assert.equal(pfp.smartphones.pfpSmartphonesAll, '/smartphones/all-smartphones/');
  });

  test('pfp.tvs contains pfpTvsAll', () => {
    assert.equal(pfp.tvs.pfpTvsAll, '/tvs/all-tvs/');
  });

  test('pfp grouped entries cover all PFP entries in PAGE_PATH_CHOICES', () => {
    const allPfpValues = new Set(PAGE_PATH_CHOICES.filter(c => c.type === 'PFP').map(c => c.value));
    const groupedValues = new Set(Object.values(pfp).flatMap(g => Object.keys(g)));
    for (const v of allPfpValues) {
      assert.ok(groupedValues.has(v), `PFP value "${v}" missing from pfp grouped export`);
    }
  });
});

// ── pcd ──────────────────────────────────────────────────────────────────────

describe('pcd grouped export', () => {
  test('pcd is an object', () => {
    assert.ok(pcd && typeof pcd === 'object');
  });

  test('pcd.smartphones contains pcdSmartphones', () => {
    assert.equal(pcd.smartphones.pcdSmartphones, '/smartphones/');
  });

  test('pcd.tvs contains pcdTvs', () => {
    assert.equal(pcd.tvs.pcdTvs, '/tvs/');
  });

  test('pcd grouped entries cover all PCD entries in PAGE_PATH_CHOICES', () => {
    const allPcdValues = new Set(PAGE_PATH_CHOICES.filter(c => c.type === 'PCD').map(c => c.value));
    const groupedValues = new Set(Object.values(pcd).flatMap(g => Object.keys(g)));
    for (const v of allPcdValues) {
      assert.ok(groupedValues.has(v), `PCD value "${v}" missing from pcd grouped export`);
    }
  });
});

// ── pdp ──────────────────────────────────────────────────────────────────────

describe('pdp grouped export', () => {
  const EXPECTED_DEVICE_LINES = ['galaxyZFold', 'galaxyZFlip', 'galaxyS25', 'galaxyS24'];

  test('pdp is an object with device line keys', () => {
    assert.ok(pdp && typeof pdp === 'object');
    for (const line of EXPECTED_DEVICE_LINES) {
      assert.ok(line in pdp, `pdp missing device line: ${line}`);
    }
  });

  test('pdp.galaxyS25 contains pdpGalaxyS25', () => {
    assert.equal(pdp.galaxyS25.pdpGalaxyS25, '/smartphones/galaxy-s25/');
  });

  test('pdp grouped entries cover all PDP entries in PAGE_PATH_CHOICES', () => {
    const allPdpValues = new Set(PAGE_PATH_CHOICES.filter(c => c.type === 'PDP').map(c => c.value));
    const groupedValues = new Set(Object.values(pdp).flatMap(g => Object.keys(g)));
    for (const v of allPdpValues) {
      assert.ok(groupedValues.has(v), `PDP value "${v}" missing from pdp grouped export`);
    }
  });
});

// ── buy ──────────────────────────────────────────────────────────────────────

describe('buy grouped export', () => {
  const EXPECTED_DEVICE_LINES = ['galaxyZFold', 'galaxyZFlip', 'galaxyS25', 'galaxyS24'];

  test('buy is an object with device line keys', () => {
    assert.ok(buy && typeof buy === 'object');
    for (const line of EXPECTED_DEVICE_LINES) {
      assert.ok(line in buy, `buy missing device line: ${line}`);
    }
  });

  test('buy.galaxyS25 contains buyGalaxyS25', () => {
    assert.equal(buy.galaxyS25.buyGalaxyS25, '/smartphones/galaxy-s25/buy/');
  });

  test('buy grouped entries cover all BUY entries in PAGE_PATH_CHOICES', () => {
    const allBuyValues = new Set(PAGE_PATH_CHOICES.filter(c => c.type === 'BUY').map(c => c.value));
    const groupedValues = new Set(Object.values(buy).flatMap(g => Object.keys(g)));
    for (const v of allBuyValues) {
      assert.ok(groupedValues.has(v), `BUY value "${v}" missing from buy grouped export`);
    }
  });
});
```

> **Note:** The test file already imports from `'../src/page-paths.js'` at line 3. Update that import line to also destructure `pfp, pcd, pdp, buy`:
> ```js
> import { PAGE_PATH_CHOICES, buildPagePathsJs, getPagePathPromptChoices, pfp, pcd, pdp, buy } from '../src/page-paths.js';
> ```

**Step 2: Run tests to confirm they fail**

```bash
node --test tests/page-paths.test.js
```

Expected: new `pfp`/`pcd`/`pdp`/`buy` tests fail with `TypeError: pfp is not defined` (or similar). All pre-existing tests still pass.

---

### Task 2: Implement grouped exports in `src/page-paths.js`

**Files:**
- Modify: `src/page-paths.js`

**Step 1: Add the four grouped exports at the bottom of the file (after line 157)**

```js
// ── Grouped exports (type → category) ────────────────────────────────────────

/**
 * PFP (Product Filter/Listing) page paths, grouped by product category.
 * Spread the categories you need: `{ ...pfp.smartphones, ...pfp.tvs }`
 */
export const pfp = {
  smartphones: {
    pfpSmartphonesAll:     '/smartphones/all-smartphones/',
    pfpSmartphonesGalaxyA: '/smartphones/galaxy-a/',
    pfpSmartphonesGalaxyS: '/smartphones/galaxy-s/',
    pfpSmartphonesGalaxyZ: '/smartphones/galaxy-z/',
  },
  tablets: {
    pfpTabletsAll:        '/tablets/all-tablets/',
    pfpTabletsGalaxyTabS: '/tablets/galaxy-tab-s/',
    pfpTabletsGalaxyTabA: '/tablets/galaxy-tab-a/',
  },
  computers: {
    pfpComputersAll:        '/computers/all-computers/',
    pfpComputersGalaxyBook: '/computers/galaxy-book/',
    pfpComputersChromebook: '/computers/chromebook/',
  },
  monitors: {
    pfpMonitorsAll:    '/monitors/all-monitors/',
    pfpMonitorsGaming: '/monitors/gaming/',
  },
  watches: {
    pfpWatchesAll:        '/watches/all-watches/',
    pfpWatchesGalaxyWatch: '/watches/galaxy-watch/',
  },
  tvs: {
    pfpTvsNeoQled:   '/tvs/neo-qled-tvs/',
    pfpTvsOled:      '/tvs/oled-tvs/',
    pfpTvsQled:      '/tvs/qled-tvs/',
    pfpTvs8k:        '/tvs/8k-tv/',
    pfpTvsAll:       '/tvs/all-tvs/',
    pfpTvsCrystalUhd: '/tvs/all-tvs/?crystal-uhd',
  },
  lifestyleTvs: {
    pfpLifestyleTheFrame:   '/lifestyle-tvs/the-frame/',
    pfpLifestyleTheSerif:   '/lifestyle-tvs/the-serif/',
    pfpLifestyleTheTerrace: '/lifestyle-tvs/the-terrace/',
    pfpLifestyleTheSero:    '/lifestyle-tvs/the-sero/',
  },
  audio: {
    pfpAudioAll: '/audio-devices/all-audio-devices/',
  },
  refrigerators: {
    pfpRefrigeratorsAll: '/refrigerators/all-refrigerators/',
    pfpRefrigSmart:       '/refrigerators/smart/',
    pfpRefrigFrenchDoor:  '/refrigerators/french-door/',
    pfpRefrigSideBySide:  '/refrigerators/side-by-side/',
  },
  washers: {
    pfpWashersAll:      '/washers-and-dryers/all-washers-and-dryers/',
    pfpWashingMachines: '/washers-and-dryers/washing-machines/',
    pfpWasherDryerCombo: '/washers-and-dryers/washer-dryer-combo/',
    pfpDryers:           '/washers-and-dryers/dryers/',
  },
  cooking: {
    pfpCookingAll:   '/cooking-appliances/all-cooking-appliances/',
    pfpCookingOvens: '/cooking-appliances/ovens/',
    pfpCookingHobs:  '/cooking-appliances/hobs/',
    pfpMicrowaveAll: '/microwave-ovens/all-microwave-ovens/',
    pfpCookingHoods: '/cooking-appliances/hoods/',
  },
  dishwashers: {
    pfpDishwashersAll: '/dishwashers/all-dishwashers/',
  },
  vacuums: {
    pfpVacuumAll: '/vacuum-cleaners/all-vacuum-cleaners/',
  },
};

/**
 * PCD (Product Category/Department hub) page paths, grouped by product category.
 */
export const pcd = {
  smartphones:  { pcdSmartphones:  '/smartphones/' },
  tablets:      { pcdTablets:      '/tablets/' },
  computers:    { pcdComputers:    '/computers/' },
  monitors:     { pcdMonitors:     '/monitors/' },
  watches:      { pcdWatches:      '/watches/' },
  tvs:          { pcdTvs:          '/tvs/' },
  lifestyleTvs: { pcdLifestyleTvs: '/lifestyle-tvs/' },
  audio:        { pcdAudio:        '/audio-devices/' },
  projectors:   { pcdProjectors:   '/projectors/' },
  refrigerators:{ pcdRefrigerators: '/refrigerators/' },
  washers:      { pcdWashers:      '/washers-and-dryers/' },
  cooking:      { pcdCooking:      '/cooking-appliances/' },
  dishwashers:  { pcdDishwashers:  '/dishwashers/' },
  vacuums:      { pcdVacuum:       '/vacuum-cleaners/' },
};

/**
 * PDP (Product Detail Page) paths, grouped by device line.
 */
export const pdp = {
  galaxyZFold: {
    pdpGalaxyZFold7: '/smartphones/galaxy-z-fold7/',
    pdpGalaxyZFold6: '/smartphones/galaxy-z-fold6/',
  },
  galaxyZFlip: {
    pdpGalaxyZFlip7:   '/smartphones/galaxy-z-flip7/',
    pdpGalaxyZFlip7Fe: '/smartphones/galaxy-z-flip7-fe/',
    pdpGalaxyZFlip6:   '/smartphones/galaxy-z-flip6/',
  },
  galaxyS25: {
    pdpGalaxyS25:      '/smartphones/galaxy-s25/',
    pdpGalaxyS25Edge:  '/smartphones/galaxy-s25-edge/',
    pdpGalaxyS25Ultra: '/smartphones/galaxy-s25-ultra/',
  },
  galaxyS24: {
    pdpGalaxyS24:      '/smartphones/galaxy-s24/',
    pdpGalaxyS24Fe:    '/smartphones/galaxy-s24-fe/',
    pdpGalaxyS24Ultra: '/smartphones/galaxy-s24-ultra/',
  },
};

/**
 * BUY (Purchase/buy flow) page paths, grouped by device line.
 */
export const buy = {
  galaxyZFold: {
    buyGalaxyZFold7: '/smartphones/galaxy-z-fold7/buy/',
    buyGalaxyZFold6: '/smartphones/galaxy-z-fold6/buy/',
  },
  galaxyZFlip: {
    buyGalaxyZFlip7:   '/smartphones/galaxy-z-flip7/buy/',
    buyGalaxyZFlip7Fe: '/smartphones/galaxy-z-flip7-fe/buy/',
    buyGalaxyZFlip6:   '/smartphones/galaxy-z-flip6/buy/',
  },
  galaxyS25: {
    buyGalaxyS25:      '/smartphones/galaxy-s25/buy/',
    buyGalaxyS25Edge:  '/smartphones/galaxy-s25-edge/buy/',
    buyGalaxyS25Ultra: '/smartphones/galaxy-s25-ultra/buy/',
  },
  galaxyS24: {
    buyGalaxyS24:      '/smartphones/galaxy-s24/buy/',
    buyGalaxyS24Fe:    '/smartphones/galaxy-s24-fe/buy/',
    buyGalaxyS24Ultra: '/smartphones/galaxy-s24-ultra/buy/',
  },
};
```

**Step 2: Run tests to confirm they all pass**

```bash
node --test tests/page-paths.test.js
```

Expected: All tests pass, including the new grouped export tests.

**Step 3: Commit**

```bash
git add src/page-paths.js tests/page-paths.test.js
git commit -m "feat: add pfp/pcd/pdp/buy grouped exports to page-paths module"
```

---

### Task 3: Remove `buildPagePathsJs` and update its tests

**Files:**
- Modify: `src/page-paths.js`
- Modify: `tests/page-paths.test.js`

**Step 1: Delete the `buildPagePathsJs` function from `src/page-paths.js`**

Remove lines 139–157 (the `buildPagePathsJs` function and its JSDoc comment).

**Step 2: Remove `buildPagePathsJs` tests from `tests/page-paths.test.js`**

Delete the following test blocks (they test `buildPagePathsJs` which no longer exists):
- `'buildPagePathsJs generates correct JS object literal from selections'`
- `'buildPagePathsJs generates TODO comment when no selections'`
- `'buildPagePathsJs handles single selection'`
- `'buildPagePathsJs output is valid JS structure (parseable)'`
- `'buildPagePathsJs handles null input gracefully'`

Also remove `buildPagePathsJs` from the import at the top of the test file:
```js
// Before:
import { PAGE_PATH_CHOICES, buildPagePathsJs, getPagePathPromptChoices, pfp, pcd, pdp, buy } from '../src/page-paths.js';
// After:
import { PAGE_PATH_CHOICES, getPagePathPromptChoices, pfp, pcd, pdp, buy } from '../src/page-paths.js';
```

**Step 3: Run tests to confirm all pass**

```bash
node --test tests/page-paths.test.js
```

Expected: All pass. No reference to `buildPagePathsJs`.

**Step 4: Commit**

```bash
git add src/page-paths.js tests/page-paths.test.js
git commit -m "refactor: remove buildPagePathsJs (replaced by importable grouped exports)"
```

---

### Task 4: Add `exports` field to generator `package.json`

**Files:**
- Modify: `package.json`

**Step 1: Add `exports` field**

In `package.json`, add an `exports` field after the `"bin"` field:

```json
"exports": {
    ".": "./bin/cli.js",
    "./page-paths": "./src/page-paths.js"
},
```

The full relevant section of `package.json` becomes:

```json
"bin": {
    "experiment-e2e-generator": "./bin/cli.js"
},
"exports": {
    ".": "./bin/cli.js",
    "./page-paths": "./src/page-paths.js"
},
```

**Step 2: Verify the export resolves**

```bash
node -e "import('experiment-e2e-generator/page-paths').then(m => console.log(Object.keys(m)))" 2>&1 || node --input-type=module <<< "import { pfp } from './src/page-paths.js'; console.log(Object.keys(pfp));"
```

Expected output includes: `smartphones`, `tvs`, etc.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: expose page-paths as package subpath export"
```

---

### Task 5: Update the `page-paths.config.js` template

**Files:**
- Modify: `templates/tests/config/page-paths.config.js`

**Step 1: Replace template contents entirely**

```js
/**
 * Page paths for {{EXPERIMENT_NAME}} tests.
 *
 * Import the groups your experiment targets from the page-paths catalogue.
 *
 * Available groups:
 *   pfp  — pfp.smartphones · pfp.tvs · pfp.tablets · pfp.computers
 *          pfp.monitors · pfp.watches · pfp.audio · pfp.lifestyleTvs
 *          pfp.refrigerators · pfp.washers · pfp.cooking
 *          pfp.dishwashers · pfp.vacuums
 *   pcd  — pcd.smartphones · pcd.tvs · pcd.lifestyleTvs · pcd.audio
 *          pcd.projectors · pcd.refrigerators · pcd.washers · pcd.cooking
 *          pcd.dishwashers · pcd.vacuums
 *   pdp  — pdp.galaxyS25 · pdp.galaxyS24 · pdp.galaxyZFold · pdp.galaxyZFlip
 *   buy  — buy.galaxyS25 · buy.galaxyS24 · buy.galaxyZFold · buy.galaxyZFlip
 *
 * Example — spread multiple groups:
 *   import { pfp, pdp } from 'experiment-e2e-generator/page-paths';
 *   export const pagePaths = { ...pfp.smartphones, ...pdp.galaxyS25 };
 */
import { pfp } from 'experiment-e2e-generator/page-paths';

// Adjust to the pages your experiment targets:
export const pagePaths = {
  ...pfp.smartphones,
};
```

**Step 2: Commit**

```bash
git add templates/tests/config/page-paths.config.js
git commit -m "feat: update page-paths template to import from module"
```

---

### Task 6: Remove `PAGE_PATHS_JS` from `src/file-operations.js`

**Files:**
- Modify: `src/file-operations.js`

**Step 1: Remove `buildPagePathsJs` import and variable**

In `src/file-operations.js`:

1. Remove the `buildPagePathsJs` import from line 5:
   ```js
   // Remove this line:
   import { buildPagePathsJs } from './page-paths.js';
   ```

2. In `generateTestFiles()`, remove `PAGE_PATHS_JS` from the `variables` object (line 37):
   ```js
   // Remove this line from variables:
   PAGE_PATHS_JS: buildPagePathsJs(config.pagePaths ?? []),
   ```

**Step 2: Run full test suite to confirm no regressions**

```bash
node --test tests/*.test.js
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add src/file-operations.js
git commit -m "refactor: remove PAGE_PATHS_JS template variable from file-operations"
```

---

### Task 7: Remove the page-path prompt step from `src/generator.js`

**Files:**
- Modify: `src/generator.js`

**Step 1: Remove `getPagePathSelections` import**

On line 4, remove `getPagePathSelections` from the import:
```js
// Before:
import { getUserInput, confirmAction, selectComponentSelector, getPagePathSelections } from './prompts.js';
// After:
import { getUserInput, confirmAction, selectComponentSelector } from './prompts.js';
```

**Step 2: Remove the page-path selection block**

Remove lines 58–64:
```js
// Delete this entire block:
// Step 2.4: Get page path selections
console.log(chalk.blue('\n🗂  Which pages does this experiment run on?\n'));
const pagePaths = await getPagePathSelections();
if (pagePaths.length > 0) {
  console.log(chalk.gray(`   Page paths: ${pagePaths.map(p => p.value).join(', ')}`));
}
config.pagePaths = pagePaths;
```

**Step 3: Run a quick smoke test by invoking the CLI help**

```bash
node bin/cli.js --help 2>&1 || node -e "import('./src/generator.js').then(() => console.log('module loads ok'))"
```

Expected: Module loads without errors.

**Step 4: Commit**

```bash
git add src/generator.js
git commit -m "feat: remove interactive page-path prompt from generator flow"
```

---

### Task 8: Add generator as devDependency in `src/package-updater.js`

**Files:**
- Modify: `src/package-updater.js`
- Modify: `tests/package-updater.test.js`

**Step 1: Write failing tests for the new behaviour**

Add these tests to `tests/package-updater.test.js` inside the existing `describe('updatePackageJson', ...)` block:

```js
it('includes experiment-e2e-generator in packages when missing from devDependencies', async () => {
  const tmpDir = await createTempProject({ name: 'test', version: '1.0.0' });
  try {
    const result = await updatePackageJson(tmpDir);
    assert.ok(
      result.packages.some(p => p.startsWith('experiment-e2e-generator@')),
      `expected experiment-e2e-generator in packages, got: ${JSON.stringify(result.packages)}`
    );
  } finally {
    await fs.remove(tmpDir);
  }
});

it('does not add experiment-e2e-generator when already in devDependencies', async () => {
  const tmpDir = await createTempProject({
    name: 'test',
    version: '1.0.0',
    devDependencies: {
      '@playwright/test': '^1.40.0',
      'experiment-e2e-generator': '^1.0.0',
    },
    scripts: {
      'test:e2e': 'playwright test',
      'test:e2e:experiment': 'playwright test tests/e2e/*/experiment-test.spec.js',
    },
  });
  try {
    const result = await updatePackageJson(tmpDir);
    assert.ok(
      !result.packages.some(p => p.startsWith('experiment-e2e-generator@')),
      'should not re-add experiment-e2e-generator when already present'
    );
  } finally {
    await fs.remove(tmpDir);
  }
});
```

**Step 2: Run to confirm they fail**

```bash
node --test tests/package-updater.test.js
```

Expected: The two new tests fail; all existing tests pass.

**Step 3: Implement the change in `src/package-updater.js`**

At the top of the file, add a dynamic version read (after the existing imports):

```js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname_pkg = path.dirname(fileURLToPath(import.meta.url));
const { version: GENERATOR_VERSION } = JSON.parse(
  readFileSync(path.join(__dirname_pkg, '..', 'package.json'), 'utf-8')
);
```

In `updatePackageJson()`, add a check for `experiment-e2e-generator` alongside the Playwright check:

```js
const needsGenerator = !existingDevDeps['experiment-e2e-generator'];

if (needsGenerator) {
  changes.push('Added experiment-e2e-generator to devDependencies');
}
```

And in the `packages` return value, include it:

```js
const packages = [
  ...(needsPlaywright ? ['@playwright/test@1.40.0', 'playwright@1.40.0'] : []),
  ...(needsGenerator  ? [`experiment-e2e-generator@^${GENERATOR_VERSION}`] : []),
];
```

**Step 4: Run tests to confirm all pass**

```bash
node --test tests/package-updater.test.js
```

Expected: All tests pass including the two new ones.

**Step 5: Run full test suite**

```bash
node --test tests/*.test.js
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/package-updater.js tests/package-updater.test.js
git commit -m "feat: add experiment-e2e-generator as devDep in generated project"
```

---

### Task 9: End-to-end smoke test

**Step 1: Create a temporary test project**

```bash
mkdir /tmp/e2e-smoke-test && cd /tmp/e2e-smoke-test
yarn init -y
```

**Step 2: Run the generator (linked locally)**

```bash
cd /path/to/experiment-e2e-generator
yarn link
cd /tmp/e2e-smoke-test
npx /path/to/experiment-e2e-generator
```

Fill in any experiment name (e.g. "Smoke Test"), base URL, and market. Confirm no page-path selection prompt appears.

**Step 3: Verify the generated file**

```bash
cat /tmp/e2e-smoke-test/tests/config/page-paths.config.js
```

Expected: Contains `import { pfp } from 'experiment-e2e-generator/page-paths'` and `export const pagePaths = { ...pfp.smartphones }`.

**Step 4: Verify `experiment-e2e-generator` was added to package.json**

```bash
cat /tmp/e2e-smoke-test/package.json | grep experiment-e2e-generator
```

Expected: Shows `"experiment-e2e-generator": "^1.2.4"` (or current version) under devDependencies.

**Step 5: Clean up**

```bash
rm -rf /tmp/e2e-smoke-test
```

---

### Task 10: Final commit and version bump

**Step 1: Verify full test suite is green**

```bash
node --test tests/*.test.js
```

Expected: All tests pass.

**Step 2: Bump patch version**

```bash
yarn version --patch
```

**Step 3: Final commit**

```bash
git add .
git commit -m "chore: bump version after page-paths importable module feature"
```
