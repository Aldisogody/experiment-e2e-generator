import path from 'path';
import prompts from 'prompts';
import { detectExperimentName } from './utils.js';
import { getMarketChoices, resolveMarkets, formatMarketCodes } from './markets.js';
import { PAGE_PATH_CHOICES, getPagePathPromptChoices } from './page-paths.js';

/**
 * Get user input through interactive prompts
 * @param {string} cwd - Current working directory
 * @returns {Promise<Object>} - User responses
 */
export async function getUserInput(cwd) {
	// Try to detect experiment name
	const detectedName = await detectExperimentName(cwd);
	
	const questions = [
		{
			type: 'text',
			name: 'experimentName',
			message: 'What is your experiment name?',
			initial: detectedName || '',
			validate: (value) => {
				if (!value.trim()) {
					return 'Experiment name is required';
				}
				return true;
			},
		},
		{
			type: 'text',
			name: 'baseUrl',
			message: 'Base URL for tests (e.g., https://www.samsung.com)',
			initial: 'https://www.samsung.com',
			validate: (value) => {
				if (!value.trim()) {
					return 'Base URL is required';
				}
				try {
					new URL(value);
					return true;
				} catch {
					return 'Please enter a valid URL';
				}
			},
		},
		{
			type: 'autocomplete',
			name: 'market',
			message: 'Select market or market group (type to search, or enter custom code)',
			choices: getMarketChoices(),
			suggest: (input, choices) => {
				const inputLower = input.toLowerCase();
				return choices.filter(
					(choice) =>
						choice.title.toLowerCase().includes(inputLower) ||
						choice.value.toLowerCase().includes(inputLower)
				);
			},
			fallback: (input) => {
				// Allow custom market codes that aren't in the predefined list
				if (input && input.trim()) {
					return { title: input.toUpperCase(), value: input.toUpperCase() };
				}
				return null;
			},
		},
		{
			type: 'toggle',
			name: 'runEslintOnTests',
			message: 'Run ESLint on tests?',
			initial: false,
			active: 'Yes',
			inactive: 'No (add to .eslintignore)',
		},
	];
	
	const response = await prompts(questions, {
		onCancel: () => {
			console.log('\nOperation cancelled by user');
			process.exit(0);
		},
	});

	// Resolve market selection to market group and countries array
	if (response.market) {
		const { marketGroup, markets } = resolveMarkets(response.market);
		response.marketGroup = marketGroup;
		response.markets = markets;

		// Display resolved markets for user confirmation
		if (markets.length > 1) {
			console.log(`\n  Selected markets: ${formatMarketCodes(markets)}`);
		}
	}
	
	return response;
}

/**
 * Present scanned selector candidates and let the user pick one.
 * @param {Array<{value: string, type: number, file: string, line: number}>} candidates
 * @returns {Promise<string|null>} Selected selector string, or null if placeholder chosen
 */
export async function selectComponentSelector(candidates) {
	if (candidates.length === 0) {
		return null;
	}

	const typeLabels = { 1: 'injected marker', 2: 'config export', 3: 'selectors obj', 4: 'querySelector' };

	const choices = candidates.map((c) => ({
		title: `${c.value}  [${typeLabels[c.type] ?? `type ${c.type}`}]  — ${path.basename(c.file)}`,
		value: c.value,
	}));

	choices.push({ title: 'Use placeholder (add manually later)', value: null });

	const response = await prompts({
		type: 'select',
		name: 'selector',
		message: 'Select the component selector for your experiment tests',
		choices,
	}, {
		onCancel: () => {
			return { selector: null };
		},
	});

	return response.selector ?? null;
}

/**
 * Multi-select prompt: which Samsung page categories does this experiment target?
 * Choices are grouped by page type (PFP / PCD / PDP / BUY) with visual separators.
 * @returns {Promise<Array<{value: string, path: string, type: string}>>} Selected entries
 */
export async function getPagePathSelections() {
	const response = await prompts({
		type: 'multiselect',
		name: 'pagePaths',
		message: 'Which page paths does your experiment target? (space to select, enter to confirm)',
		choices: getPagePathPromptChoices(),
		hint: '- Space to select. Return to submit',
		instructions: false,
	}, {
		onCancel: () => ({ pagePaths: [] }),
	});

	const selectedValues = (response.pagePaths ?? []).filter(v => !String(v).startsWith('__sep_'));

	// Re-attach path + type from PAGE_PATH_CHOICES (prompts returns only value)
	return selectedValues.map((value) => {
		const choice = PAGE_PATH_CHOICES.find((c) => c.value === value);
		return choice ?? { value, path: `/${value}/`, type: 'PFP' };
	});
}

/**
 * Ask user for confirmation before overwriting
 * @param {string} message - Confirmation message
 * @param {boolean} initialValue - Default value (default: true)
 * @returns {Promise<boolean>}
 */
export async function confirmAction(message, initialValue = true) {
	const response = await prompts({
		type: 'toggle',
		name: 'value',
		message,
		initial: initialValue,
		active: 'Yes',
		inactive: 'No',
	}, {
		onCancel: () => {
			return { value: false };
		},
	});
	
	return response.value;
}
