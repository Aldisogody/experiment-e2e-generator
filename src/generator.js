import path from 'path';
import chalk from 'chalk';
import { validateProjectDirectory, pathExists } from './utils.js';
import { getUserInput, confirmAction } from './prompts.js';
import { generateTestFiles, testsDirectoryExists, getGeneratedFilesList } from './file-operations.js';
import { updatePackageJson, isPlaywrightInstalled } from './package-updater.js';

/**
 * Main generator function
 */
export async function generator() {
	const cwd = process.cwd();
	
	console.log(chalk.blue.bold('\n🎭 Experiment E2E Test Generator\n'));
	
	// Step 1: Pre-flight checks
	console.log(chalk.gray('Running pre-flight checks...'));
	
	const validation = await validateProjectDirectory(cwd);
	if (!validation.isValid) {
		console.error(chalk.red(`\n✗ ${validation.error}\n`));
		process.exit(1);
	}
	
	// Check if tests directory already exists
	const testsExist = await testsDirectoryExists(cwd);
	if (testsExist) {
		console.log(chalk.yellow('\n⚠ Warning: tests/ directory already exists'));
		const shouldContinue = await confirmAction(
			'Do you want to overwrite existing test files?'
		);
		
		if (!shouldContinue) {
			console.log(chalk.gray('\nOperation cancelled.\n'));
			process.exit(0);
		}
	}
	
	// Check if Playwright is already installed
	const playwrightInstalled = await isPlaywrightInstalled(cwd);
	if (playwrightInstalled) {
		console.log(chalk.gray('✓ Playwright is already installed'));
	}
	
	// Step 2: Get user input
	console.log(chalk.blue('\nPlease provide the following information:\n'));
	const config = await getUserInput(cwd);
	
	// Step 3: Generate files
	console.log(chalk.blue('\n📁 Generating test files...\n'));
	
	try {
		const { testsDir, experimentDir } = await generateTestFiles(cwd, config);
		
		const generatedFiles = getGeneratedFilesList(config.experimentName);
		generatedFiles.forEach(file => {
			console.log(chalk.green(`  ✓ ${file}`));
		});
		
		// Step 4: Update package.json
		console.log(chalk.blue('\n📦 Updating package.json...\n'));
		
		const packageResult = await updatePackageJson(cwd);
		if (packageResult.updated) {
			packageResult.changes.forEach(change => {
				console.log(chalk.green(`  ✓ ${change}`));
			});
		} else {
			console.log(chalk.gray('  ℹ No package.json updates needed'));
		}
		
		// Step 5: Display completion message
		console.log(chalk.green.bold('\n✓ Test structure generated successfully!\n'));
		
		console.log(chalk.blue('Next steps:\n'));
		console.log(chalk.white('  1. Install dependencies:'));
		console.log(chalk.gray('     yarn install\n'));
		
		console.log(chalk.white('  2. Update test URLs in:'));
		console.log(chalk.gray('     tests/config/qa-links.config.js\n'));
		
		console.log(chalk.white('  3. Customize test selectors in:'));
		console.log(chalk.gray(`     tests/e2e/${config.experimentName.toLowerCase().replace(/\s+/g, '-')}/${config.experimentName.toLowerCase().replace(/\s+/g, '-')}.spec.js\n`));
		
		console.log(chalk.white('  4. Run tests:'));
		console.log(chalk.gray('     yarn test:e2e\n'));
		
		console.log(chalk.blue('📖 Documentation:'));
		console.log(chalk.gray('   https://playwright.dev/docs/intro\n'));
		
	} catch (error) {
		console.error(chalk.red('\n✗ Error generating test files:\n'));
		console.error(chalk.red(error.message));
		if (error.stack) {
			console.error(chalk.gray('\n' + error.stack));
		}
		process.exit(1);
	}
}
