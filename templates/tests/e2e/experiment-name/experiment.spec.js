import { test, expect } from '@playwright/test';
import { experimentConfig } from '../../config/experiment.config.js';
import { qaLinksConfig, validateUrls } from '../../config/qa-links.config.js';

const markets = qaLinksConfig.markets;

test.describe('{{EXPERIMENT_NAME}}', () => {
	test.beforeAll(() => {
		validateUrls();
	});

	for (const market of markets) {
		const { controlUrl, experimentUrl } = qaLinksConfig.getUrls(market.code);

		test.describe(`[${market.code}] Control`, () => {
			test.beforeEach(async ({ page }) => {
				await page.goto(controlUrl, { timeout: experimentConfig.timeouts.navigation });
			});

			test('should not display experiment component', async ({ page }) => {
				// TODO: Update this selector to match your experiment component
				const experimentComponent = page.locator('[data-experiment="{{EXPERIMENT_NAME_KEBAB}}"]');

				await expect(experimentComponent).not.toBeVisible();
			});

			test('should display baseline content', async ({ page }) => {
				// TODO: Add assertions to verify baseline/control content
				// Example:
				// await expect(page.getByRole('heading', { name: 'Control Heading' })).toBeVisible();
			});
		});

		test.describe(`[${market.code}] Experiment`, () => {
			test.beforeEach(async ({ page }) => {
				await page.goto(experimentUrl, { timeout: experimentConfig.timeouts.navigation });
			});

			test('should display experiment component', async ({ page }) => {
				// TODO: Update this selector to match your experiment component
				const experimentComponent = page.locator('[data-experiment="{{EXPERIMENT_NAME_KEBAB}}"]');

				await expect(experimentComponent).toBeVisible();
			});

			test('should have correct experiment styling', async ({ page }) => {
				// TODO: Add assertions to verify experiment-specific styling or content
				// Example:
				// const experimentButton = page.getByRole('button', { name: 'Experiment CTA' });
				// await expect(experimentButton).toBeVisible();
				// await expect(experimentButton).toHaveCSS('background-color', 'rgb(0, 119, 200)');
			});

			test('should handle user interactions correctly', async ({ page }) => {
				// TODO: Add test for user interactions with the experiment component
				// Example:
				// await page.getByRole('button', { name: 'Click Me' }).click();
				// await expect(page.getByText('Success!')).toBeVisible();
			});
		});
	}
});
