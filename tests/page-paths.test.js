import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_PATH_CHOICES, buildPagePathsJs, getPagePathPromptChoices } from '../src/page-paths.js';

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
