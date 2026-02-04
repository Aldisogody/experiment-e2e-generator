export const MARKET_GROUPS = {
	// Multi-country market groups
	SEBN: {
		name: 'Benelux',
		countries: [
			{ code: 'BE', urlPath: 'be', name: 'Belgium (NL)' },
			{ code: 'BE_FR', urlPath: 'be_fr', name: 'Belgium (FR)' },
			{ code: 'NL', urlPath: 'nl', name: 'Netherlands' },
		],
	},
	SENA: {
		name: 'Nordics',
		countries: [
			{ code: 'SE', urlPath: 'se', name: 'Sweden' },
			{ code: 'NO', urlPath: 'no', name: 'Norway' },
			{ code: 'DK', urlPath: 'dk', name: 'Denmark' },
			{ code: 'FI', urlPath: 'fi', name: 'Finland' },
		],
	},
	SEIB: {
		name: 'Iberia',
		countries: [
			{ code: 'ES', urlPath: 'es', name: 'Spain' },
			{ code: 'PT', urlPath: 'pt', name: 'Portugal' },
		],
	},

	// Single-country market groups
	SEUK: {
		name: 'UK',
		countries: [{ code: 'UK', urlPath: 'uk', name: 'United Kingdom' }],
	},
	SEF: {
		name: 'France',
		countries: [{ code: 'FR', urlPath: 'fr', name: 'France' }],
	},
	SEG: {
		name: 'Germany',
		countries: [{ code: 'DE', urlPath: 'de', name: 'Germany' }],
	},
	SEI: {
		name: 'Italy',
		countries: [{ code: 'IT', urlPath: 'it', name: 'Italy' }],
	},
	SEPOL: {
		name: 'Poland',
		countries: [{ code: 'PL', urlPath: 'pl', name: 'Poland' }],
	},
	SECA: {
		name: 'Canada',
		countries: [{ code: 'CA', urlPath: 'ca', name: 'Canada' }],
	},

	// Additional European markets
	EUROPE_AL: {
		name: 'Albania',
		countries: [{ code: 'AL', urlPath: 'al', name: 'Albania' }],
	},
	EUROPE_AT: {
		name: 'Austria',
		countries: [{ code: 'AT', urlPath: 'at', name: 'Austria' }],
	},
	EUROPE_BA: {
		name: 'Bosnia',
		countries: [{ code: 'BA', urlPath: 'ba', name: 'Bosnia' }],
	},
	EUROPE_BG: {
		name: 'Bulgaria',
		countries: [{ code: 'BG', urlPath: 'bg', name: 'Bulgaria' }],
	},
	EUROPE_HR: {
		name: 'Croatia',
		countries: [{ code: 'HR', urlPath: 'hr', name: 'Croatia' }],
	},
	EUROPE_CZ: {
		name: 'Czech Republic',
		countries: [{ code: 'CZ', urlPath: 'cz', name: 'Czech Republic' }],
	},
	EUROPE_EE: {
		name: 'Estonia',
		countries: [{ code: 'EE', urlPath: 'ee', name: 'Estonia' }],
	},
	EUROPE_GR: {
		name: 'Greece',
		countries: [{ code: 'GR', urlPath: 'gr', name: 'Greece' }],
	},
	EUROPE_HU: {
		name: 'Hungary',
		countries: [{ code: 'HU', urlPath: 'hu', name: 'Hungary' }],
	},
	EUROPE_IE: {
		name: 'Ireland',
		countries: [{ code: 'IE', urlPath: 'ie', name: 'Ireland' }],
	},
	EUROPE_LV: {
		name: 'Latvia',
		countries: [{ code: 'LV', urlPath: 'lv', name: 'Latvia' }],
	},
	EUROPE_LT: {
		name: 'Lithuania',
		countries: [{ code: 'LT', urlPath: 'lt', name: 'Lithuania' }],
	},
	EUROPE_MK: {
		name: 'Macedonia',
		countries: [{ code: 'MK', urlPath: 'mk', name: 'Macedonia' }],
	},
	EUROPE_RO: {
		name: 'Romania',
		countries: [{ code: 'RO', urlPath: 'ro', name: 'Romania' }],
	},
	EUROPE_RS: {
		name: 'Serbia',
		countries: [{ code: 'RS', urlPath: 'rs', name: 'Serbia' }],
	},
	EUROPE_SK: {
		name: 'Slovakia',
		countries: [{ code: 'SK', urlPath: 'sk', name: 'Slovakia' }],
	},
	EUROPE_SI: {
		name: 'Slovenia',
		countries: [{ code: 'SI', urlPath: 'si', name: 'Slovenia' }],
	},
	EUROPE_CH: {
		name: 'Switzerland',
		countries: [{ code: 'CH', urlPath: 'ch', name: 'Switzerland' }],
	},
};

/**
 * Generate choices for the market selection prompt
 * @returns {Array} - Array of choices for prompts autocomplete
 */
export function getMarketChoices() {
	const choices = [];

	// Add multi-country groups first (most useful)
	const multiCountryGroups = ['SEBN', 'SENA', 'SEIB'];
	multiCountryGroups.forEach((groupCode) => {
		const group = MARKET_GROUPS[groupCode];
		const countryCodes = group.countries.map((c) => c.code).join(', ');
		choices.push({
			title: `${groupCode} - ${group.name} (${countryCodes})`,
			value: groupCode,
			description: `Includes: ${countryCodes}`,
		});
	});

	// Add single-country major markets
	const majorMarkets = ['SEUK', 'SEF', 'SEG', 'SEI', 'SEPOL', 'SECA'];
	majorMarkets.forEach((groupCode) => {
		const group = MARKET_GROUPS[groupCode];
		const country = group.countries[0];
		choices.push({
			title: `${groupCode} - ${group.name} (${country.code})`,
			value: groupCode,
			description: country.name,
		});
	});

	// Add European markets
	Object.entries(MARKET_GROUPS)
		.filter(([code]) => code.startsWith('EUROPE_'))
		.forEach(([groupCode, group]) => {
			const country = group.countries[0];
			choices.push({
				title: `${country.code} - ${group.name}`,
				value: groupCode,
				description: country.name,
			});
		});

	return choices;
}

/**
 * Resolve market input to an array of market objects
 * Handles both market group codes and individual market codes
 * @param {string} marketInput - Market group code or individual market code
 * @returns {{ marketGroup: string, markets: Array<{code: string, urlPath: string, name: string}> }}
 */
export function resolveMarkets(marketInput) {
	const upperInput = marketInput.toUpperCase();

	// Check if it's a known market group
	if (MARKET_GROUPS[upperInput]) {
		return {
			marketGroup: upperInput,
			markets: MARKET_GROUPS[upperInput].countries,
		};
	}

	// Check if it matches a country code within any group
	for (const [groupCode, group] of Object.entries(MARKET_GROUPS)) {
		const matchingCountry = group.countries.find(
			(c) => c.code.toUpperCase() === upperInput
		);
		if (matchingCountry) {
			return {
				marketGroup: groupCode,
				markets: [matchingCountry],
			};
		}
	}

	// Treat as custom/unknown market - create a market object from the input
	const urlPath = marketInput.toLowerCase().replace(/_/g, '_');
	return {
		marketGroup: upperInput,
		markets: [
			{
				code: upperInput,
				urlPath: urlPath,
				name: upperInput,
			},
		],
	};
}

/**
 * Get a formatted string of market codes for display
 * @param {Array<{code: string}>} markets - Array of market objects
 * @returns {string} - Comma-separated list of market codes
 */
export function formatMarketCodes(markets) {
	return markets.map((m) => m.code).join(', ');
}
