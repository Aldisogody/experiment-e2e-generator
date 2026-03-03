import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_PATH_CHOICES, buildPagePathsJs, getPagePathPromptChoices } from '../src/page-paths.js';

// Grouped exports (pfp, pcd, pdp, buy) – loaded dynamically so pre-existing
// tests still run even before Task 2 adds these exports to page-paths.js.
let pfp, pcd, pdp, buy;
try {
  const mod = await import('../src/page-paths.js');
  pfp = mod.pfp;
  pcd = mod.pcd;
  pdp = mod.pdp;
  buy = mod.buy;
} catch {
  // exports not yet implemented – new tests below will fail with clear messages
}

test('PAGE_PATH_CHOICES is a non-empty array with all 4 page types', () => {
	assert.ok(Array.isArray(PAGE_PATH_CHOICES));
	assert.ok(PAGE_PATH_CHOICES.length >= 60, `expected >=60 entries, got ${PAGE_PATH_CHOICES.length}`);
	const types = new Set(PAGE_PATH_CHOICES.map(c => c.type));
	assert.deepEqual([...types].sort(), ['BUY', 'PCD', 'PDP', 'PFP']);
});

test('each choice has title, value, path, and type fields', () => {
	const validTypes = new Set(['PFP', 'PCD', 'PDP', 'BUY']);
	for (const choice of PAGE_PATH_CHOICES) {
		assert.ok(typeof choice.title === 'string', `title missing on ${JSON.stringify(choice)}`);
		assert.ok(typeof choice.value === 'string', `value missing on ${JSON.stringify(choice)}`);
		assert.ok(typeof choice.path === 'string', `path missing on ${JSON.stringify(choice)}`);
		assert.ok(choice.path.startsWith('/'), `path must start with / on ${choice.value}`);
		assert.ok(validTypes.has(choice.type), `invalid type "${choice.type}" on ${choice.value}`);
	}
});

test('buildPagePathsJs generates correct JS object literal from selections', () => {
	const selections = [
		{ value: 'pfpTvsAll', path: '/tvs/all-tvs/', type: 'PFP' },
		{ value: 'pfpTvsOled', path: '/tvs/oled-tvs/', type: 'PFP' },
	];
	const result = buildPagePathsJs(selections);
	assert.ok(result.includes("pfpTvsAll: '/tvs/all-tvs/'"), `missing pfpTvsAll in:\n${result}`);
	assert.ok(result.includes("pfpTvsOled: '/tvs/oled-tvs/'"), `missing pfpTvsOled in:\n${result}`);
	assert.ok(result.startsWith('export const pagePaths = {'), `wrong start:\n${result}`);
	assert.ok(result.trimEnd().endsWith('};'), `wrong end:\n${result}`);
});

test('buildPagePathsJs generates TODO comment when no selections', () => {
	const result = buildPagePathsJs([]);
	assert.ok(result.includes('// TODO'), `should contain TODO comment:\n${result}`);
	assert.ok(result.startsWith('export const pagePaths = {'), `wrong start:\n${result}`);
});

test('value keys in PAGE_PATH_CHOICES are unique', () => {
	const values = PAGE_PATH_CHOICES.map(c => c.value);
	const unique = new Set(values);
	assert.equal(unique.size, values.length, 'duplicate value keys found');
});

test('buildPagePathsJs handles single selection', () => {
	const result = buildPagePathsJs([{ value: 'pfpTvsAll', path: '/tvs/all-tvs/', type: 'PFP' }]);
	assert.ok(result.includes("pfpTvsAll: '/tvs/all-tvs/'"));
	assert.ok(result.startsWith('export const pagePaths = {'));
	assert.ok(result.trimEnd().endsWith('};'));
});

test('buildPagePathsJs output is valid JS structure (parseable)', () => {
	const selections = PAGE_PATH_CHOICES.slice(0, 5);
	const result = buildPagePathsJs(selections);
	const body = result.replace('export const pagePaths = ', 'const pagePaths = ');
	assert.doesNotThrow(() => new Function(body));
});

test('buildPagePathsJs handles null input gracefully', () => {
	const result = buildPagePathsJs(null);
	assert.ok(result.includes('// TODO'));
});

test('getPagePathPromptChoices inserts separator headers between types', () => {
	const choices = getPagePathPromptChoices();
	const separators = choices.filter(c => c.disabled);
	assert.equal(separators.length, 4, 'should have one separator per page type');
	const selectable = choices.filter(c => !c.disabled);
	assert.ok(selectable.every(c => !String(c.value).startsWith('__sep_')), 'selectable entries must not have __sep_ values');
});

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
