/**
 * Experiment configuration for {{EXPERIMENT_NAME}}.
 */
export const experimentConfig = {
	name: '{{EXPERIMENT_NAME}}',
	marketGroup: '{{MARKET_GROUP}}',
	markets: {{MARKETS_JSON}},

	timeouts: {
		navigation: 30000,
		element: 5000,
	},

	getMarket(code) {
		return this.markets.find(m => m.code === code);
	},
};
