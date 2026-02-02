export const qaLinksConfig = {
	controlUrl: process.env.CONTROL_URL || '{{BASE_URL}}/{{MARKET}}/control-page/',
	experimentUrl: process.env.EXPERIMENT_URL || '{{BASE_URL}}/{{MARKET}}/experiment-page/',
};

/**
 * Validates that required URLs are configured
 * @throws {Error} if required URLs are missing
 */
export function validateUrls() {
	if (!qaLinksConfig.controlUrl || !qaLinksConfig.experimentUrl) {
		throw new Error(
			'Missing required URLs. Please set CONTROL_URL and EXPERIMENT_URL environment variables ' +
			'or update the URLs in tests/config/qa-links.config.js'
		);
	}
}
