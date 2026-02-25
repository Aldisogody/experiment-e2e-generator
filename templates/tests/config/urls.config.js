/**
 * URL configuration for {{EXPERIMENT_NAME}} bundle injection tests.
 *
 * bundlePath: path to your built experiment bundle, relative to project root.
 * Common values: 'dist/v1-index.jsx', 'dist/bundle.js', 'build/index.js'
 */
export const urlsConfig = {
	baseUrl: '{{BASE_URL}}',
	bundlePath: 'dist/v1-index.jsx',
	markets: {{MARKETS_JSON}},

	getUrl(marketCode, pagePath) {
		const market = this.markets.find(m => m.code === marketCode);
		if (!market) throw new Error(`Unknown market: ${marketCode}`);
		return `${this.baseUrl}/${market.urlPath}${pagePath}`;
	},
};
