/**
 * QA Links configuration for multi-market testing
 * Supports environment variables per market: CONTROL_URL_BE, EXPERIMENT_URL_NL, etc.
 */
export const qaLinksConfig = {
	baseUrl: '{{BASE_URL}}',
	markets: {{MARKETS_JSON}},

	/**
	 * Get URLs for a specific market
	 * @param {string} marketCode - Market code (e.g., 'NL', 'BE')
	 * @returns {{ controlUrl: string, experimentUrl: string }}
	 */
	getUrls(marketCode) {
		const market = this.markets.find((m) => m.code === marketCode);
		if (!market) {
			throw new Error(`Unknown market code: ${marketCode}`);
		}

		return {
			controlUrl:
				process.env[`CONTROL_URL_${marketCode}`] ||
				`${this.baseUrl}/${market.urlPath}/control-page/`,
			experimentUrl:
				process.env[`EXPERIMENT_URL_${marketCode}`] ||
				`${this.baseUrl}/${market.urlPath}/experiment-page/`,
		};
	},

	/**
	 * Get URLs for all configured markets
	 * @returns {Array<{ code: string, urlPath: string, name: string, controlUrl: string, experimentUrl: string }>}
	 */
	getAllUrls() {
		return this.markets.map((market) => ({
			...market,
			...this.getUrls(market.code),
		}));
	},

	/**
	 * Get all market codes
	 * @returns {string[]}
	 */
	getMarketCodes() {
		return this.markets.map((m) => m.code);
	},
};

/**
 * Validates that required URL environment variables are set for all markets.
 * Throws with actionable instructions if any are missing.
 *
 * Set variables inline:   CONTROL_URL_NL=https://... npx playwright test
 * Or in a .env file:      CONTROL_URL_NL=https://...
 *
 * @throws {Error} if required URLs are missing
 */
export function validateUrls() {
	const missing = [];

	for (const market of qaLinksConfig.markets) {
		if (!process.env[`CONTROL_URL_${market.code}`]) {
			missing.push(`CONTROL_URL_${market.code}`);
		}
		if (!process.env[`EXPERIMENT_URL_${market.code}`]) {
			missing.push(`EXPERIMENT_URL_${market.code}`);
		}
	}

	if (missing.length === 0) {
		return;
	}

	const example = missing
		.map((v) => `  ${v}=https://www.samsung.com/...`)
		.join('\n');

	throw new Error(
		`Missing QA link environment variables:\n\n${example}\n\n` +
			`Set them before running tests, e.g.:\n` +
			`  ${missing[0]}=https://... npx playwright test\n\n` +
			`Or update the fallback URLs in tests/config/qa-links.config.js`
	);
}
