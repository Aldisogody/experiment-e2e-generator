import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { urlsConfig } from '../../config/urls.config.js';
import { experimentConfig } from '../../config/experiment.config.js';

const BUNDLE_PATH = join(process.cwd(), urlsConfig.bundlePath);

function loadBundle() {
	if (!existsSync(BUNDLE_PATH)) {
		throw new Error(
			`Bundle not found at ${BUNDLE_PATH}.\n` +
			`Run \`yarn build\` before running e2e tests.`
		);
	}
	return readFileSync(BUNDLE_PATH, 'utf8');
}

// ─── Tests run for every configured market ─────────────────────────────────

for (const market of experimentConfig.markets) {
	test.describe(`{{EXPERIMENT_NAME}} — ${market.name} (${market.code})`, () => {
		let bundle;

		test.beforeAll(() => {
			bundle = loadBundle();
		});

		test.beforeEach(async ({ page }) => {
			await page.goto(urlsConfig.getUrl(market.code));
		});

		test('bundle loads without errors', async ({ page }) => {
			const errors = [];
			page.on('pageerror', err => errors.push(err.message));
			await page.addScriptTag({ content: bundle });
			expect(errors).toEqual([]);
		});

		test('experiment component appears after injection', async ({ page }) => {
			await page.addScriptTag({ content: bundle });
			const component = page.locator('{{COMPONENT_SELECTOR}}');
			await expect(component).toBeVisible();
		});

		test('control page is unmodified before injection', async ({ page }) => {
			// Verify the experiment component does NOT appear without the bundle
			const component = page.locator('{{COMPONENT_SELECTOR}}');
			await expect(component).not.toBeVisible();
		});
	});
}
