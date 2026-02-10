import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	MARKET_GROUPS,
	resolveMarkets,
	getMarketChoices,
	formatMarketCodes,
} from '../src/markets.js';

describe('MARKET_GROUPS', () => {
	it('contains multi-country groups', () => {
		assert.ok(MARKET_GROUPS.SEBN);
		assert.ok(MARKET_GROUPS.SENA);
		assert.ok(MARKET_GROUPS.SEIB);
	});

	it('SEBN includes BE, BE_FR, NL', () => {
		const codes = MARKET_GROUPS.SEBN.countries.map((c) => c.code);
		assert.deepEqual(codes, ['BE', 'BE_FR', 'NL']);
	});

	it('SENA includes SE, NO, DK, FI', () => {
		const codes = MARKET_GROUPS.SENA.countries.map((c) => c.code);
		assert.deepEqual(codes, ['SE', 'NO', 'DK', 'FI']);
	});

	it('SEIB includes ES, PT', () => {
		const codes = MARKET_GROUPS.SEIB.countries.map((c) => c.code);
		assert.deepEqual(codes, ['ES', 'PT']);
	});

	it('each market has required fields', () => {
		for (const [, group] of Object.entries(MARKET_GROUPS)) {
			assert.ok(group.name, 'group should have a name');
			assert.ok(Array.isArray(group.countries), 'group should have countries array');
			for (const country of group.countries) {
				assert.ok(country.code, 'country should have code');
				assert.ok(country.urlPath, 'country should have urlPath');
				assert.ok(country.name, 'country should have name');
			}
		}
	});
});

describe('resolveMarkets', () => {
	it('resolves a multi-country group code', () => {
		const result = resolveMarkets('SEBN');
		assert.equal(result.marketGroup, 'SEBN');
		assert.equal(result.markets.length, 3);
		assert.deepEqual(
			result.markets.map((m) => m.code),
			['BE', 'BE_FR', 'NL']
		);
	});

	it('resolves a single-country group code', () => {
		const result = resolveMarkets('SEUK');
		assert.equal(result.marketGroup, 'SEUK');
		assert.equal(result.markets.length, 1);
		assert.equal(result.markets[0].code, 'UK');
	});

	it('resolves an individual country code within a group', () => {
		const result = resolveMarkets('NL');
		assert.equal(result.marketGroup, 'SEBN');
		assert.equal(result.markets.length, 1);
		assert.equal(result.markets[0].code, 'NL');
	});

	it('is case-insensitive', () => {
		const result = resolveMarkets('sebn');
		assert.equal(result.marketGroup, 'SEBN');
		assert.equal(result.markets.length, 3);
	});

	it('handles lowercase country code', () => {
		const result = resolveMarkets('nl');
		assert.equal(result.markets[0].code, 'NL');
	});

	it('treats unknown input as custom market', () => {
		const result = resolveMarkets('XX');
		assert.equal(result.marketGroup, 'XX');
		assert.equal(result.markets.length, 1);
		assert.equal(result.markets[0].code, 'XX');
		assert.equal(result.markets[0].urlPath, 'xx');
		assert.equal(result.markets[0].name, 'XX');
	});

	it('handles EUROPE_ prefixed groups', () => {
		const result = resolveMarkets('EUROPE_AT');
		assert.equal(result.marketGroup, 'EUROPE_AT');
		assert.equal(result.markets.length, 1);
		assert.equal(result.markets[0].code, 'AT');
	});
});

describe('getMarketChoices', () => {
	it('returns an array of choices', () => {
		const choices = getMarketChoices();
		assert.ok(Array.isArray(choices));
		assert.ok(choices.length > 0);
	});

	it('each choice has title, value, and description', () => {
		const choices = getMarketChoices();
		for (const choice of choices) {
			assert.ok(choice.title, 'choice should have title');
			assert.ok(choice.value, 'choice should have value');
			assert.ok(choice.description !== undefined, 'choice should have description');
		}
	});

	it('starts with multi-country groups', () => {
		const choices = getMarketChoices();
		const firstThreeValues = choices.slice(0, 3).map((c) => c.value);
		assert.deepEqual(firstThreeValues, ['SEBN', 'SENA', 'SEIB']);
	});

	it('includes major single-country markets', () => {
		const choices = getMarketChoices();
		const values = choices.map((c) => c.value);
		assert.ok(values.includes('SEUK'));
		assert.ok(values.includes('SEF'));
		assert.ok(values.includes('SEG'));
	});

	it('includes European markets', () => {
		const choices = getMarketChoices();
		const values = choices.map((c) => c.value);
		assert.ok(values.includes('EUROPE_AT'));
		assert.ok(values.includes('EUROPE_CZ'));
	});
});

describe('formatMarketCodes', () => {
	it('formats a single market', () => {
		const result = formatMarketCodes([{ code: 'NL' }]);
		assert.equal(result, 'NL');
	});

	it('formats multiple markets with comma separator', () => {
		const result = formatMarketCodes([{ code: 'BE' }, { code: 'BE_FR' }, { code: 'NL' }]);
		assert.equal(result, 'BE, BE_FR, NL');
	});

	it('handles empty array', () => {
		const result = formatMarketCodes([]);
		assert.equal(result, '');
	});
});
