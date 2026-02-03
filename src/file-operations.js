import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { copyTemplateFile, ensureDir, toKebabCase } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * Generate all test files from templates
 * @param {string} targetDir - Target project directory
 * @param {Object} config - Configuration object with user inputs
 */
export async function generateTestFiles(targetDir, config) {
	const { experimentName, baseUrl, market } = config;
	const experimentNameKebab = toKebabCase(experimentName);
	
	// Template variables
	const variables = {
		EXPERIMENT_NAME: experimentName,
		EXPERIMENT_NAME_KEBAB: experimentNameKebab,
		BASE_URL: baseUrl,
		MARKET: market.toUpperCase(),
	};
	
	// Define file mappings: [source, destination]
	const fileMappings = [
		// Root level playwright config
		['playwright.config.js', 'playwright.config.js'],
		
		// Config files
		['tests/config/index.js', 'tests/config/index.js'],
		['tests/config/experiment.config.js', 'tests/config/experiment.config.js'],
		['tests/config/qa-links.config.js', 'tests/config/qa-links.config.js'],
		
		// Fixtures
		['tests/fixtures/test-fixtures.js', 'tests/fixtures/test-fixtures.js'],
		
		// Utils
		['tests/utils/test-helpers.js', 'tests/utils/test-helpers.js'],
		
		// Test spec (with dynamic folder name)
		[
			'tests/e2e/experiment-name/experiment.spec.js',
			`tests/e2e/${experimentNameKebab}/${experimentNameKebab}.spec.js`,
		],
	];
	
	// Copy and process each template file
	for (const [source, dest] of fileMappings) {
		const sourcePath = path.join(TEMPLATES_DIR, source);
		const destPath = path.join(targetDir, dest);
		
		await copyTemplateFile(sourcePath, destPath, variables);
	}
	
	return {
		testsDir: path.join(targetDir, 'tests'),
		experimentDir: path.join(targetDir, 'tests', 'e2e', experimentNameKebab),
	};
}

/**
 * Check if tests directory already exists
 * @param {string} targetDir - Target project directory
 * @returns {Promise<boolean>}
 */
export async function testsDirectoryExists(targetDir) {
	const testsPath = path.join(targetDir, 'tests');
	return await fs.pathExists(testsPath);
}

/**
 * Get list of generated files for display
 * @param {string} experimentName - Experiment name
 * @returns {Array<string>} - List of file paths
 */
export function getGeneratedFilesList(experimentName) {
	const experimentNameKebab = toKebabCase(experimentName);
	
	return [
		'playwright.config.js',
		'tests/config/index.js',
		'tests/config/experiment.config.js',
		'tests/config/qa-links.config.js',
		'tests/fixtures/test-fixtures.js',
		'tests/utils/test-helpers.js',
		`tests/e2e/${experimentNameKebab}/${experimentNameKebab}.spec.js`,
	];
}

/**
 * Add tests/ to .eslintignore if not already present.
 * Does nothing if .eslintignore does not exist.
 * @param {string} targetDir - Target project directory
 * @returns {Promise<{updated: boolean}>} - Whether the file was updated
 */
export async function addTestsToEslintIgnore(targetDir) {
	const eslintIgnorePath = path.join(targetDir, '.eslintignore');

	if (!(await fs.pathExists(eslintIgnorePath))) {
		return { updated: false };
	}

	const content = await fs.readFile(eslintIgnorePath, 'utf-8');
	const lines = content.split(/\r?\n/);
	const hasTestsEntry = lines.some((line) => {
		const trimmed = line.trim();
		return trimmed === 'tests' || trimmed === 'tests/';
	});

	if (hasTestsEntry) {
		return { updated: false };
	}

	const suffix = content.endsWith('\n') ? '' : '\n';
	const newContent = content + suffix + 'tests/\n';
	await fs.writeFile(eslintIgnorePath, newContent, 'utf-8');

	return { updated: true };
}
