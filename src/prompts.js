import prompts from 'prompts';
import { detectExperimentName } from './utils.js';

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
			type: 'text',
			name: 'market',
			message: 'Primary market code (e.g., NL, BE)',
			initial: 'NL',
			validate: (value) => {
				if (!value.trim()) {
					return 'Market code is required';
				}
				if (value.length > 5) {
					return 'Market code should be short (e.g., NL, BE, UK)';
				}
				return true;
			},
		},
		{
			type: 'confirm',
			name: 'runEslintOnTests',
			message: 'Do you want to run ESLint on tests?',
			initial: false,
		},
	];
	
	const response = await prompts(questions, {
		onCancel: () => {
			console.log('\nOperation cancelled by user');
			process.exit(0);
		},
	});
	
	return response;
}

/**
 * Ask user for confirmation before overwriting
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>}
 */
export async function confirmAction(message) {
	const response = await prompts({
		type: 'confirm',
		name: 'value',
		message,
		initial: false,
	}, {
		onCancel: () => {
			return false;
		},
	});
	
	return response.value;
}
