/**
 * URL configuration for {{EXPERIMENT_NAME}} bundle injection tests.
 *
 * bundlePath: path to your built experiment bundle, relative to project root.
 * Common values: 'dist/v1-index.jsx', 'dist/bundle.js', 'build/index.js'
 *
 * getUrl(marketCode): returns the production page URL to inject the bundle into.
 * Replace the path segment with a real product/landing page from your market.
 */
export const urlsConfig = {
	baseUrl: '{{BASE_URL}}',
	bundlePath: 'dist/v1-index.jsx',
	markets: {{MARKETS_JSON}},

	getUrl(marketCode) {
		const market = this.markets.find(m => m.code === marketCode);
		if (!market) throw new Error(`Unknown market: ${marketCode}`);
		// TODO: replace '/smartphones/' with the page your experiment targets
		return `${this.baseUrl}/${market.urlPath}/smartphones/`;
	},
};
