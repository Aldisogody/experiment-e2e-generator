import prompts from 'prompts';
import { detectExperimentName } from './utils.js';
import { getMarketChoices, resolveMarkets, formatMarketCodes } from './markets.js';

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
