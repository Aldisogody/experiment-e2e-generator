import { test as base } from '@playwright/test';
import { experimentConfig } from '../config/index.js';

/**
 * Custom test fixtures for {{EXPERIMENT_NAME}} experiment
 * Extend Playwright's base test with custom fixtures and utilities
 */
export const test = base.extend({
	/**
	 * Custom fixture for experiment context
	 * Provides experiment-specific configuration and utilities
	 */
	experimentContext: async ({}, use) => {
		const context = {
			name: experimentConfig.name,
			marketGroup: experimentConfig.marketGroup,
			baseUrl: experimentConfig.baseUrl,
			
			/**
			 * Helper to construct URLs with experiment parameters
			 * @param {string} path - URL path
			 * @param {Object} params - Additional query parameters
			 */
			buildUrl: (path, params = {}) => {
				const url = new URL(path, experimentConfig.baseUrl);
				Object.entries(params).forEach(([key, value]) => {
					url.searchParams.append(key, value);
				});
				return url.toString();
			},
		};
		
		await use(context);
	},
	
	/**
	 * Custom fixture for Adobe Target preview (if applicable)
	 */
	adobePreview: async ({ page }, use) => {
		if (experimentConfig.adobePreviewToken) {
			// Add Adobe preview token to page context
			await page.addInitScript((token) => {
				window.adobePreviewToken = token;
			}, experimentConfig.adobePreviewToken);
		}
		
		await use(page);
	},
});

export { expect } from '@playwright/test';
