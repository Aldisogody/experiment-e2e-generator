/**
 * Test helper utilities for {{EXPERIMENT_NAME}} experiment
 * Reusable functions for common test operations
 */

/**
 * Wait for network idle state
 * Useful for waiting for async operations to complete
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Maximum wait time in milliseconds
 */
export async function waitForNetworkIdle(page, timeout = 5000) {
	await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for a specific element to be stable (no animations)
 * @param {Locator} locator - Playwright locator
 * @param {number} timeout - Maximum wait time in milliseconds
 */
export async function waitForStable(locator, timeout = 3000) {
	await locator.waitFor({ state: 'visible', timeout });
	// Wait a bit for any CSS transitions/animations to complete
	await new Promise(resolve => setTimeout(resolve, 300));
}

/**
 * Get computed style of an element
 * @param {Locator} locator - Playwright locator
 * @param {string} property - CSS property name
 * @returns {Promise<string>} - Computed style value
 */
export async function getComputedStyle(locator, property) {
	return await locator.evaluate((el, prop) => {
		return window.getComputedStyle(el).getPropertyValue(prop);
	}, property);
}

/**
 * Check if element is in viewport
 * @param {Locator} locator - Playwright locator
 * @returns {Promise<boolean>}
 */
export async function isInViewport(locator) {
	return await locator.evaluate((el) => {
		const rect = el.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	});
}

/**
 * Scroll element into view smoothly
 * @param {Locator} locator - Playwright locator
 */
export async function scrollIntoView(locator) {
	await locator.evaluate((el) => {
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	});
	// Wait for scroll to complete
	await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Take a screenshot with a descriptive name
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @returns {Promise<Buffer>}
 */
export async function takeScreenshot(page, name) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	return await page.screenshot({
		path: `screenshots/${name}-${timestamp}.png`,
		fullPage: true,
	});
}

/**
 * Wait for specific text to appear on page
 * @param {Page} page - Playwright page object
 * @param {string} text - Text to wait for
 * @param {number} timeout - Maximum wait time in milliseconds
 */
export async function waitForText(page, text, timeout = 5000) {
	await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * Retry an action with exponential backoff
 * @param {Function} action - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 */
export async function retryWithBackoff(action, maxRetries = 3, initialDelay = 1000) {
	let lastError;
	
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await action();
		} catch (error) {
			lastError = error;
			if (i < maxRetries - 1) {
				const delay = initialDelay * Math.pow(2, i);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}
	}
	
	throw lastError;
}
