import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// TODO: Update this path to match your project's build output
// Common paths: 'dist/v1-index.jsx', 'dist/bundle.js', 'build/index.js'
const BUNDLE_PATH = join(process.cwd(), 'dist', 'v1-index.jsx');

function loadBundle() {
	if (!existsSync(BUNDLE_PATH)) {
		throw new Error(
			`Bundle not found at ${BUNDLE_PATH}.\n` +
			`1. Run \`yarn build\` before e2e tests.\n` +
			`2. If your bundle path differs, update BUNDLE_PATH in this file.`
		);
	}
	return readFileSync(BUNDLE_PATH, 'utf8');
}

test.describe('{{EXPERIMENT_NAME}} - Bundle Test', () => {
	let bundleCode;

	test.beforeAll(() => {
		bundleCode = loadBundle();
	});

	test.beforeEach(async ({ page }) => {
		await page.goto('about:blank');
		await page.addScriptTag({ content: bundleCode });
	});

	test('bundle loads without errors', async ({ page }) => {
		// Verify the bundle loaded and no uncaught errors occurred.
		// This is a baseline smoke test — customize the assertions below
		// to match your experiment's rendered output.
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));

		// Re-inject after attaching error listener for a clean check
		await page.goto('about:blank');
		await page.addScriptTag({ content: bundleCode });

		// TODO: Replace this with a selector for your experiment's main component.
		// Examples:
		//   await expect(page.getByRole('button', { name: 'Shop Now' })).toBeVisible();
		//   await expect(page.locator('[data-experiment="{{EXPERIMENT_NAME_KEBAB}}"]')).toBeVisible();

		expect(errors).toEqual([]);
	});

	test('takes screenshot after bundle injection', async ({ page }) => {
		// Captures the visual state after the bundle renders.
		// Useful for visual regression checks in CI.
		await page.screenshot();
	});
});
