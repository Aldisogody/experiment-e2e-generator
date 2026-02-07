/**
 * QA Links configuration for multi-market testing
 * Supports environment variables per market: CONTROL_URL_BE, EXPERIMENT_URL_NL, etc.
 */
export const qaLinksConfig = {
	baseUrl: '{{BASE_URL}}',
	markets: JSON.parse('{{MARKETS_JSON}}'),

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
	const missingEnvVars = [];

	for (const market of qaLinksConfig.markets) {
		if (!process.env[`CONTROL_URL_${market.code}`]) {
			missingEnvVars.push(`CONTROL_URL_${market.code}`);
		}
		if (!process.env[`EXPERIMENT_URL_${market.code}`]) {
			missingEnvVars.push(`EXPERIMENT_URL_${market.code}`);
		}
	}

	if (missingEnvVars.length > 0) {
		console.warn(
			`Warning: The following environment variables are not set. ` +
				`Falling back to default URL patterns:\n${missingEnvVars.join(', ')}`
		);
	}
}
