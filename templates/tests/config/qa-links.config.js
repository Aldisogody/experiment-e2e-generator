/**
 * QA Links configuration for multi-market testing
 * Supports environment variables per market: CONTROL_URL_BE, EXPERIMENT_URL_NL, etc.
 */
export const qaLinksConfig = {
	baseUrl: '{{BASE_URL}}',
	markets: '{{MARKETS_JSON}}',

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
 * Validates that required URLs are configured for all markets
 * @throws {Error} if required URLs are missing
 */
export function validateUrls() {
	const missingUrls = [];

	for (const market of qaLinksConfig.markets) {
		const urls = qaLinksConfig.getUrls(market.code);
		if (!urls.controlUrl) {
			missingUrls.push(`CONTROL_URL_${market.code}`);
		}
		if (!urls.experimentUrl) {
			missingUrls.push(`EXPERIMENT_URL_${market.code}`);
		}
	}

	if (missingUrls.length > 0) {
		throw new Error(
			`Missing required URLs. Please set the following environment variables ` +
				`or update the URLs in tests/config/qa-links.config.js:\n${missingUrls.join(', ')}`
		);
	}
}
