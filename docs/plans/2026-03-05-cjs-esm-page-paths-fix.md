# CJS/ESM Page-Paths Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a CommonJS shim for `src/page-paths.js` and wire it up via conditional `exports` so that CJS callers (target experiment projects without `"type": "module"`) can `require('experiment-e2e-generator/page-paths')` without error.

**Architecture:** Create `src/page-paths.cjs` as a plain `module.exports` mirror of all named exports from `src/page-paths.js`. Update the `"./page-paths"` export in `package.json` to use `{ "import": ..., "require": ... }` conditional exports. Add a parity test to prevent drift between the two files.

**Tech Stack:** Node.js CJS (`module.exports`), Node.js `node:test` runner, `node:assert/strict`

---

### Task 1: Add parity test (RED)

**Files:**
- Modify: `tests/page-paths.test.js`

**Step 1: Add the failing parity test at the bottom of `tests/page-paths.test.js`**

```js
// ── CJS shim parity ──────────────────────────────────────────────────────────

test('page-paths.cjs exports same top-level keys as page-paths.js', async () => {
	const { createRequire } = await import('node:module');
	const { fileURLToPath } = await import('node:url');
	const { dirname, join } = await import('node:path');

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const requireCjs = createRequire(join(__dirname, '../src/page-paths.cjs'));
	const cjsExports = requireCjs('../src/page-paths.cjs');

	const esmKeys = ['PAGE_PATH_CHOICES', 'getPagePathPromptChoices', 'pfp', 'pcd', 'pdp', 'buy'];
	for (const key of esmKeys) {
		assert.ok(key in cjsExports, `page-paths.cjs missing export: ${key}`);
	}
});
```

**Step 2: Run tests to verify the new test fails**

```bash
nvm use 24 && yarn test
```

Expected: all existing tests pass; the new parity test fails with something like `Cannot find module '../src/page-paths.cjs'`.

---

### Task 2: Create `src/page-paths.cjs` (GREEN)

**Files:**
- Create: `src/page-paths.cjs`

**Step 1: Create the file**

Copy all data from `src/page-paths.js` and export via `module.exports`. The file must be self-contained (no `require` of the ESM source).

```js
'use strict';

// ── PAGE_PATH_CHOICES ─────────────────────────────────────────────────────────

const PAGE_PATH_CHOICES = [
	// ── PFP: Smartphones ─────────────────────────────────────────────────────
	{ title: 'PFP · All Smartphones',        value: 'pfpSmartphonesAll',        path: '/smartphones/all-smartphones/',            type: 'PFP' },
	{ title: 'PFP · Galaxy A',               value: 'pfpSmartphonesGalaxyA',    path: '/smartphones/galaxy-a/',                   type: 'PFP' },
	{ title: 'PFP · Galaxy S',               value: 'pfpSmartphonesGalaxyS',    path: '/smartphones/galaxy-s/',                   type: 'PFP' },
	{ title: 'PFP · Galaxy Z',               value: 'pfpSmartphonesGalaxyZ',    path: '/smartphones/galaxy-z/',                   type: 'PFP' },
	// ── PFP: Tablets ─────────────────────────────────────────────────────────
	{ title: 'PFP · All Tablets',            value: 'pfpTabletsAll',            path: '/tablets/all-tablets/',                    type: 'PFP' },
	{ title: 'PFP · Galaxy Tab S',           value: 'pfpTabletsGalaxyTabS',     path: '/tablets/galaxy-tab-s/',                   type: 'PFP' },
	{ title: 'PFP · Galaxy Tab A',           value: 'pfpTabletsGalaxyTabA',     path: '/tablets/galaxy-tab-a/',                   type: 'PFP' },
	// ── PFP: Computers ───────────────────────────────────────────────────────
	{ title: 'PFP · All Computers',          value: 'pfpComputersAll',          path: '/computers/all-computers/',                type: 'PFP' },
	{ title: 'PFP · Galaxy Book',            value: 'pfpComputersGalaxyBook',   path: '/computers/galaxy-book/',                  type: 'PFP' },
	{ title: 'PFP · Chromebook',             value: 'pfpComputersChromebook',   path: '/computers/chromebook/',                   type: 'PFP' },
	// ── PFP: Monitors ────────────────────────────────────────────────────────
	{ title: 'PFP · All Monitors',           value: 'pfpMonitorsAll',           path: '/monitors/all-monitors/',                  type: 'PFP' },
	{ title: 'PFP · Gaming Monitors',        value: 'pfpMonitorsGaming',        path: '/monitors/gaming/',                        type: 'PFP' },
	// ── PFP: Watches ─────────────────────────────────────────────────────────
	{ title: 'PFP · All Watches',            value: 'pfpWatchesAll',            path: '/watches/all-watches/',                    type: 'PFP' },
	{ title: 'PFP · Galaxy Watch',           value: 'pfpWatchesGalaxyWatch',    path: '/watches/galaxy-watch/',                   type: 'PFP' },
	// ── PFP: TVs ─────────────────────────────────────────────────────────────
	{ title: 'PFP · Neo QLED TVs',           value: 'pfpTvsNeoQled',            path: '/tvs/neo-qled-tvs/',                       type: 'PFP' },
	{ title: 'PFP · OLED TVs',               value: 'pfpTvsOled',               path: '/tvs/oled-tvs/',                           type: 'PFP' },
	{ title: 'PFP · QLED TVs',               value: 'pfpTvsQled',               path: '/tvs/qled-tvs/',                           type: 'PFP' },
	{ title: 'PFP · 8K TVs',                 value: 'pfpTvs8k',                 path: '/tvs/8k-tv/',                              type: 'PFP' },
	{ title: 'PFP · All TVs',                value: 'pfpTvsAll',                path: '/tvs/all-tvs/',                            type: 'PFP' },
	{ title: 'PFP · Crystal UHD TVs',        value: 'pfpTvsCrystalUhd',         path: '/tvs/all-tvs/?crystal-uhd',                type: 'PFP' },
	{ title: 'PFP · The Frame',              value: 'pfpLifestyleTheFrame',      path: '/lifestyle-tvs/the-frame/',                type: 'PFP' },
	{ title: 'PFP · The Serif',              value: 'pfpLifestyleTheSerif',      path: '/lifestyle-tvs/the-serif/',                type: 'PFP' },
	{ title: 'PFP · The Terrace',            value: 'pfpLifestyleTheTerrace',    path: '/lifestyle-tvs/the-terrace/',              type: 'PFP' },
	{ title: 'PFP · The Sero',               value: 'pfpLifestyleTheSero',       path: '/lifestyle-tvs/the-sero/',                 type: 'PFP' },
	// ── PFP: Audio ───────────────────────────────────────────────────────────
	{ title: 'PFP · All Audio Devices',      value: 'pfpAudioAll',              path: '/audio-devices/all-audio-devices/',        type: 'PFP' },
	// ── PFP: Refrigerators ───────────────────────────────────────────────────
	{ title: 'PFP · All Refrigerators',      value: 'pfpRefrigeratorsAll',      path: '/refrigerators/all-refrigerators/',        type: 'PFP' },
	{ title: 'PFP · Smart Refrigerators',    value: 'pfpRefrigSmart',           path: '/refrigerators/smart/',                    type: 'PFP' },
	{ title: 'PFP · French Door',            value: 'pfpRefrigFrenchDoor',      path: '/refrigerators/french-door/',              type: 'PFP' },
	{ title: 'PFP · Side-by-Side',           value: 'pfpRefrigSideBySide',      path: '/refrigerators/side-by-side/',             type: 'PFP' },
	// ── PFP: Washers & Dryers ────────────────────────────────────────────────
	{ title: 'PFP · All Washers & Dryers',   value: 'pfpWashersAll',            path: '/washers-and-dryers/all-washers-and-dryers/', type: 'PFP' },
	{ title: 'PFP · Washing Machines',       value: 'pfpWashingMachines',       path: '/washers-and-dryers/washing-machines/',    type: 'PFP' },
	{ title: 'PFP · Washer-Dryer Combo',     value: 'pfpWasherDryerCombo',      path: '/washers-and-dryers/washer-dryer-combo/',  type: 'PFP' },
	{ title: 'PFP · Dryers',                 value: 'pfpDryers',                path: '/washers-and-dryers/dryers/',              type: 'PFP' },
	// ── PFP: Cooking ─────────────────────────────────────────────────────────
	{ title: 'PFP · All Cooking',            value: 'pfpCookingAll',            path: '/cooking-appliances/all-cooking-appliances/', type: 'PFP' },
	{ title: 'PFP · Ovens',                  value: 'pfpCookingOvens',          path: '/cooking-appliances/ovens/',               type: 'PFP' },
	{ title: 'PFP · Hobs',                   value: 'pfpCookingHobs',           path: '/cooking-appliances/hobs/',                type: 'PFP' },
	{ title: 'PFP · Microwave Ovens',        value: 'pfpMicrowaveAll',          path: '/microwave-ovens/all-microwave-ovens/',    type: 'PFP' },
	{ title: 'PFP · Hoods',                  value: 'pfpCookingHoods',          path: '/cooking-appliances/hoods/',               type: 'PFP' },
	// ── PFP: Dishwashers / Vacuums ───────────────────────────────────────────
	{ title: 'PFP · All Dishwashers',        value: 'pfpDishwashersAll',        path: '/dishwashers/all-dishwashers/',            type: 'PFP' },
	{ title: 'PFP · All Vacuum Cleaners',    value: 'pfpVacuumAll',             path: '/vacuum-cleaners/all-vacuum-cleaners/',    type: 'PFP' },

	// ── PCD ──────────────────────────────────────────────────────────────────
	{ title: 'PCD · Smartphones',            value: 'pcdSmartphones',           path: '/smartphones/',                            type: 'PCD' },
	{ title: 'PCD · Tablets',                value: 'pcdTablets',               path: '/tablets/',                                type: 'PCD' },
	{ title: 'PCD · Computers',              value: 'pcdComputers',             path: '/computers/',                              type: 'PCD' },
	{ title: 'PCD · Monitors',               value: 'pcdMonitors',              path: '/monitors/',                               type: 'PCD' },
	{ title: 'PCD · Watches',                value: 'pcdWatches',               path: '/watches/',                                type: 'PCD' },
	{ title: 'PCD · TVs',                    value: 'pcdTvs',                   path: '/tvs/',                                    type: 'PCD' },
	{ title: 'PCD · Lifestyle TVs',          value: 'pcdLifestyleTvs',          path: '/lifestyle-tvs/',                          type: 'PCD' },
	{ title: 'PCD · Audio Devices',          value: 'pcdAudio',                 path: '/audio-devices/',                          type: 'PCD' },
	{ title: 'PCD · Projectors',             value: 'pcdProjectors',            path: '/projectors/',                             type: 'PCD' },
	{ title: 'PCD · Refrigerators',          value: 'pcdRefrigerators',         path: '/refrigerators/',                          type: 'PCD' },
	{ title: 'PCD · Washers & Dryers',       value: 'pcdWashers',               path: '/washers-and-dryers/',                     type: 'PCD' },
	{ title: 'PCD · Cooking',                value: 'pcdCooking',               path: '/cooking-appliances/',                     type: 'PCD' },
	{ title: 'PCD · Dishwashers',            value: 'pcdDishwashers',           path: '/dishwashers/',                            type: 'PCD' },
	{ title: 'PCD · Vacuum Cleaners',        value: 'pcdVacuum',                path: '/vacuum-cleaners/',                        type: 'PCD' },

	// ── PDP ──────────────────────────────────────────────────────────────────
	{ title: 'PDP · Galaxy Z Fold7',         value: 'pdpGalaxyZFold7',          path: '/smartphones/galaxy-z-fold7/',             type: 'PDP' },
	{ title: 'PDP · Galaxy Z Flip7',         value: 'pdpGalaxyZFlip7',          path: '/smartphones/galaxy-z-flip7/',             type: 'PDP' },
	{ title: 'PDP · Galaxy Z Flip7 FE',      value: 'pdpGalaxyZFlip7Fe',        path: '/smartphones/galaxy-z-flip7-fe/',          type: 'PDP' },
	{ title: 'PDP · Galaxy S25',             value: 'pdpGalaxyS25',             path: '/smartphones/galaxy-s25/',                 type: 'PDP' },
	{ title: 'PDP · Galaxy S25 Edge',        value: 'pdpGalaxyS25Edge',         path: '/smartphones/galaxy-s25-edge/',            type: 'PDP' },
	{ title: 'PDP · Galaxy S25 Ultra',       value: 'pdpGalaxyS25Ultra',        path: '/smartphones/galaxy-s25-ultra/',           type: 'PDP' },
	{ title: 'PDP · Galaxy Z Fold6',         value: 'pdpGalaxyZFold6',          path: '/smartphones/galaxy-z-fold6/',             type: 'PDP' },
	{ title: 'PDP · Galaxy Z Flip6',         value: 'pdpGalaxyZFlip6',          path: '/smartphones/galaxy-z-flip6/',             type: 'PDP' },
	{ title: 'PDP · Galaxy S24',             value: 'pdpGalaxyS24',             path: '/smartphones/galaxy-s24/',                 type: 'PDP' },
	{ title: 'PDP · Galaxy S24 FE',          value: 'pdpGalaxyS24Fe',           path: '/smartphones/galaxy-s24-fe/',              type: 'PDP' },
	{ title: 'PDP · Galaxy S24 Ultra',       value: 'pdpGalaxyS24Ultra',        path: '/smartphones/galaxy-s24-ultra/',           type: 'PDP' },

	// ── BUY ──────────────────────────────────────────────────────────────────
	{ title: 'BUY · Galaxy Z Fold7',         value: 'buyGalaxyZFold7',          path: '/smartphones/galaxy-z-fold7/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy Z Flip7',         value: 'buyGalaxyZFlip7',          path: '/smartphones/galaxy-z-flip7/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy Z Flip7 FE',      value: 'buyGalaxyZFlip7Fe',        path: '/smartphones/galaxy-z-flip7-fe/buy/',      type: 'BUY' },
	{ title: 'BUY · Galaxy S25',             value: 'buyGalaxyS25',             path: '/smartphones/galaxy-s25/buy/',             type: 'BUY' },
	{ title: 'BUY · Galaxy S25 Edge',        value: 'buyGalaxyS25Edge',         path: '/smartphones/galaxy-s25-edge/buy/',        type: 'BUY' },
	{ title: 'BUY · Galaxy S25 Ultra',       value: 'buyGalaxyS25Ultra',        path: '/smartphones/galaxy-s25-ultra/buy/',       type: 'BUY' },
	{ title: 'BUY · Galaxy Z Fold6',         value: 'buyGalaxyZFold6',          path: '/smartphones/galaxy-z-fold6/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy Z Flip6',         value: 'buyGalaxyZFlip6',          path: '/smartphones/galaxy-z-flip6/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy S24',             value: 'buyGalaxyS24',             path: '/smartphones/galaxy-s24/buy/',             type: 'BUY' },
	{ title: 'BUY · Galaxy S24 Ultra',       value: 'buyGalaxyS24Ultra',        path: '/smartphones/galaxy-s24-ultra/buy/',       type: 'BUY' },
	{ title: 'BUY · Galaxy S24 FE',          value: 'buyGalaxyS24Fe',           path: '/smartphones/galaxy-s24-fe/buy/',          type: 'BUY' },
];

// ── getPagePathPromptChoices ──────────────────────────────────────────────────

function getPagePathPromptChoices() {
	const typeLabels = {
		PFP: '── PFP (Filter/Listing pages)',
		PCD: '── PCD (Category hubs)',
		PDP: '── PDP (Product Detail pages)',
		BUY: '── BUY (Purchase pages)',
	};
	const choices = [];
	let lastType = null;

	for (const entry of PAGE_PATH_CHOICES) {
		if (entry.type !== lastType) {
			choices.push({ title: typeLabels[entry.type], disabled: true, value: `__sep_${entry.type}` });
			lastType = entry.type;
		}
		choices.push({ title: entry.title.replace(/^[A-Z]+ · /, ''), value: entry.value });
	}

	return choices;
}

// ── pfp ──────────────────────────────────────────────────────────────────────

const pfp = {
	smartphones: {
		pfpSmartphonesAll:      '/smartphones/all-smartphones/',
		pfpSmartphonesGalaxyA:  '/smartphones/galaxy-a/',
		pfpSmartphonesGalaxyS:  '/smartphones/galaxy-s/',
		pfpSmartphonesGalaxyZ:  '/smartphones/galaxy-z/',
	},
	tablets: {
		pfpTabletsAll:          '/tablets/all-tablets/',
		pfpTabletsGalaxyTabS:   '/tablets/galaxy-tab-s/',
		pfpTabletsGalaxyTabA:   '/tablets/galaxy-tab-a/',
	},
	computers: {
		pfpComputersAll:        '/computers/all-computers/',
		pfpComputersGalaxyBook: '/computers/galaxy-book/',
		pfpComputersChromebook: '/computers/chromebook/',
	},
	monitors: {
		pfpMonitorsAll:         '/monitors/all-monitors/',
		pfpMonitorsGaming:      '/monitors/gaming/',
	},
	watches: {
		pfpWatchesAll:          '/watches/all-watches/',
		pfpWatchesGalaxyWatch:  '/watches/galaxy-watch/',
	},
	tvs: {
		pfpTvsNeoQled:          '/tvs/neo-qled-tvs/',
		pfpTvsOled:             '/tvs/oled-tvs/',
		pfpTvsQled:             '/tvs/qled-tvs/',
		pfpTvs8k:               '/tvs/8k-tv/',
		pfpTvsAll:              '/tvs/all-tvs/',
		pfpTvsCrystalUhd:       '/tvs/all-tvs/?crystal-uhd',
	},
	lifestyleTvs: {
		pfpLifestyleTheFrame:   '/lifestyle-tvs/the-frame/',
		pfpLifestyleTheSerif:   '/lifestyle-tvs/the-serif/',
		pfpLifestyleTheTerrace: '/lifestyle-tvs/the-terrace/',
		pfpLifestyleTheSero:    '/lifestyle-tvs/the-sero/',
	},
	audio: {
		pfpAudioAll:            '/audio-devices/all-audio-devices/',
	},
	refrigerators: {
		pfpRefrigeratorsAll:    '/refrigerators/all-refrigerators/',
		pfpRefrigSmart:         '/refrigerators/smart/',
		pfpRefrigFrenchDoor:    '/refrigerators/french-door/',
		pfpRefrigSideBySide:    '/refrigerators/side-by-side/',
	},
	washers: {
		pfpWashersAll:          '/washers-and-dryers/all-washers-and-dryers/',
		pfpWashingMachines:     '/washers-and-dryers/washing-machines/',
		pfpWasherDryerCombo:    '/washers-and-dryers/washer-dryer-combo/',
		pfpDryers:              '/washers-and-dryers/dryers/',
	},
	cooking: {
		pfpCookingAll:          '/cooking-appliances/all-cooking-appliances/',
		pfpCookingOvens:        '/cooking-appliances/ovens/',
		pfpCookingHobs:         '/cooking-appliances/hobs/',
		pfpMicrowaveAll:        '/microwave-ovens/all-microwave-ovens/',
		pfpCookingHoods:        '/cooking-appliances/hoods/',
	},
	dishwashers: {
		pfpDishwashersAll:      '/dishwashers/all-dishwashers/',
	},
	vacuums: {
		pfpVacuumAll:           '/vacuum-cleaners/all-vacuum-cleaners/',
	},
};

// ── pcd ──────────────────────────────────────────────────────────────────────

const pcd = {
	smartphones:   { pcdSmartphones:   '/smartphones/' },
	tablets:       { pcdTablets:       '/tablets/' },
	computers:     { pcdComputers:     '/computers/' },
	monitors:      { pcdMonitors:      '/monitors/' },
	watches:       { pcdWatches:       '/watches/' },
	tvs:           { pcdTvs:           '/tvs/' },
	lifestyleTvs:  { pcdLifestyleTvs:  '/lifestyle-tvs/' },
	audio:         { pcdAudio:         '/audio-devices/' },
	projectors:    { pcdProjectors:    '/projectors/' },
	refrigerators: { pcdRefrigerators: '/refrigerators/' },
	washers:       { pcdWashers:       '/washers-and-dryers/' },
	cooking:       { pcdCooking:       '/cooking-appliances/' },
	dishwashers:   { pcdDishwashers:   '/dishwashers/' },
	vacuums:       { pcdVacuum:        '/vacuum-cleaners/' },
};

// ── pdp ──────────────────────────────────────────────────────────────────────

const pdp = {
	galaxyZFold: {
		pdpGalaxyZFold7:    '/smartphones/galaxy-z-fold7/',
		pdpGalaxyZFold6:    '/smartphones/galaxy-z-fold6/',
	},
	galaxyZFlip: {
		pdpGalaxyZFlip7:    '/smartphones/galaxy-z-flip7/',
		pdpGalaxyZFlip7Fe:  '/smartphones/galaxy-z-flip7-fe/',
		pdpGalaxyZFlip6:    '/smartphones/galaxy-z-flip6/',
	},
	galaxyS25: {
		pdpGalaxyS25:       '/smartphones/galaxy-s25/',
		pdpGalaxyS25Edge:   '/smartphones/galaxy-s25-edge/',
		pdpGalaxyS25Ultra:  '/smartphones/galaxy-s25-ultra/',
	},
	galaxyS24: {
		pdpGalaxyS24:       '/smartphones/galaxy-s24/',
		pdpGalaxyS24Fe:     '/smartphones/galaxy-s24-fe/',
		pdpGalaxyS24Ultra:  '/smartphones/galaxy-s24-ultra/',
	},
};

// ── buy ──────────────────────────────────────────────────────────────────────

const buy = {
	galaxyZFold: {
		buyGalaxyZFold7:    '/smartphones/galaxy-z-fold7/buy/',
		buyGalaxyZFold6:    '/smartphones/galaxy-z-fold6/buy/',
	},
	galaxyZFlip: {
		buyGalaxyZFlip7:    '/smartphones/galaxy-z-flip7/buy/',
		buyGalaxyZFlip7Fe:  '/smartphones/galaxy-z-flip7-fe/buy/',
		buyGalaxyZFlip6:    '/smartphones/galaxy-z-flip6/buy/',
	},
	galaxyS25: {
		buyGalaxyS25:       '/smartphones/galaxy-s25/buy/',
		buyGalaxyS25Edge:   '/smartphones/galaxy-s25-edge/buy/',
		buyGalaxyS25Ultra:  '/smartphones/galaxy-s25-ultra/buy/',
	},
	galaxyS24: {
		buyGalaxyS24:       '/smartphones/galaxy-s24/buy/',
		buyGalaxyS24Fe:     '/smartphones/galaxy-s24-fe/buy/',
		buyGalaxyS24Ultra:  '/smartphones/galaxy-s24-ultra/buy/',
	},
};

// ── exports ───────────────────────────────────────────────────────────────────

module.exports = { PAGE_PATH_CHOICES, getPagePathPromptChoices, pfp, pcd, pdp, buy };
```

**Step 2: Run tests again — parity test should now pass**

```bash
nvm use 24 && yarn test
```

Expected: all tests pass including the new parity test.

**Step 3: Commit**

```bash
git add src/page-paths.cjs tests/page-paths.test.js
git commit -m "feat: add CJS shim for page-paths and parity test"
```

---

### Task 3: Wire up conditional exports in `package.json`

**Files:**
- Modify: `package.json`

**Step 1: Update the `"./page-paths"` export**

Change:
```json
"./page-paths": "./src/page-paths.js"
```

To:
```json
"./page-paths": {
  "import": "./src/page-paths.js",
  "require": "./src/page-paths.cjs"
}
```

**Step 2: Verify the exports field looks correct**

```bash
node -e "const r = require('./src/page-paths.cjs'); console.log(Object.keys(r))"
```

Expected output:
```
[ 'PAGE_PATH_CHOICES', 'getPagePathPromptChoices', 'pfp', 'pcd', 'pdp', 'buy' ]
```

**Step 3: Run full test suite**

```bash
nvm use 24 && yarn test
```

Expected: all tests pass.

**Step 4: Commit**

```bash
git add package.json
git commit -m "feat: add conditional exports for page-paths CJS/ESM"
```

---

### Task 4: Smoke-test in a CJS project

**Step 1: Create a temporary CJS test project**

```bash
mkdir /tmp/cjs-smoke && cd /tmp/cjs-smoke && echo '{}' > package.json
```

(No `"type": "module"` — defaults to CJS)

**Step 2: Install the local package**

```bash
npm install /path/to/experiment-e2e-generator
```

Replace `/path/to/experiment-e2e-generator` with the absolute path to the generator directory.

**Step 3: Create a CJS test script**

```js
// /tmp/cjs-smoke/test.js
const { pfp, pcd, pdp, buy } = require('experiment-e2e-generator/page-paths');
console.log('pfp keys:', Object.keys(pfp));
console.log('pcd keys:', Object.keys(pcd));
console.log('pdp keys:', Object.keys(pdp));
console.log('buy keys:', Object.keys(buy));
console.log('CJS smoke test PASSED');
```

**Step 4: Run the smoke test**

```bash
node /tmp/cjs-smoke/test.js
```

Expected: prints all keys and `CJS smoke test PASSED` with no errors.

**Step 5: Clean up**

```bash
rm -rf /tmp/cjs-smoke
```

---

### Task 5: Bump version and publish

**Files:**
- Modify: `package.json` (version bump via yarn)

**Step 1: Bump patch version**

```bash
yarn version --patch
```

**Step 2: Publish**

```bash
yarn publish --access public
```

**Step 3: Verify the published package**

```bash
npm view experiment-e2e-generator exports
```

Expected: shows the updated conditional exports including `require` and `import` for `./page-paths`.
