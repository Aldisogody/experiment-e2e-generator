import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for {{EXPERIMENT_NAME}} experiment tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	reporter: 'html',
	use: {
		trace: 'on-first-retry',
		screenshot: 'on',
		video: 'off',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
	],
});
