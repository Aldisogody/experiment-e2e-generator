import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Bundle produced by `yarn build` (entry ./src/js/v1/index.jsx → dist/v1-index.jsx)
const BUNDLE_PATH = join(process.cwd(), 'dist', 'v1-index.jsx');

function loadBundle() {
	if (!existsSync(BUNDLE_PATH)) {
		throw new Error(
			`Bundle not found at ${BUNDLE_PATH}. Run \`yarn build\` before e2e tests.`
		);
	}
	return readFileSync(BUNDLE_PATH, 'utf8');
}

test.describe('Experiment Framework - Experiment Test', () => {
	let bundleCode;

	test.beforeAll(() => {
		bundleCode = loadBundle();
	});

	test.beforeEach(async ({ page }) => {
		await page.goto('about:blank');
		await page.addScriptTag({ content: bundleCode });
		// Wait for experiment to render (Button mounts into body)
		await page.getByRole('button', { name: /My Buttoni/ }).waitFor({ state: 'visible', timeout: 10000 });
	});

	test('Button is visible and shows label and initial counter', async ({ page }) => {
		const button = page.getByRole('button', { name: /My Buttoni/ });
		await expect(button).toBeVisible();
		await expect(button).toContainText('My Buttoni');
		await expect(button).toContainText('0');
	});

	test('Button counter increments on click', async ({ page }) => {
		const button = page.getByRole('button', { name: /My Buttoni/ });
		await expect(button).toContainText('0');
		await button.click();
		await expect(button).toContainText('1');
		await button.click();
		await expect(button).toContainText('2');
	});

	test('takes screenshot of Button component', async ({ page }) => {
		const button = page.getByRole('button', { name: /My Buttoni/ });
		await expect(button).toBeVisible();
		await page.screenshot();
	});
});
