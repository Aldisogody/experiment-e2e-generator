/**
 * Experiment configuration for {{EXPERIMENT_NAME}}
 * Contains experiment-specific settings and environment variables
 */
export const experimentConfig = {
	name: '{{EXPERIMENT_NAME}}',
	market: '{{MARKET}}',
	baseUrl: '{{BASE_URL}}',
	
	// Experiment variants
	variants: {
		control: 'control',
		experiment: 'experiment',
	},
	
	// Timeout configurations (in milliseconds)
	timeouts: {
		navigation: 30000,
		element: 5000,
		api: 10000,
	},
	
	// Test environment
	environment: process.env.TEST_ENV || 'qa',
	
	// Adobe Target preview token (if applicable)
	adobePreviewToken: process.env.ADOBE_PREVIEW_TOKEN || '',
};
