import path from 'path';
import chalk from 'chalk';
import { validateProjectDirectory } from './utils.js';
import { getUserInput, confirmAction, selectComponentSelector, getPagePathSelections } from './prompts.js';
import { scanForSelectors } from './selector-scanner.js';
import { generateTestFiles, testsDirectoryExists, getGeneratedFilesList, addTestsToEslintIgnore, addTestOutputDirsToGitignore } from './file-operations.js';
import { updatePackageJson, isPlaywrightInstalled, installDependencies, runBuildAndTests } from './package-updater.js';
import { formatMarketCodes } from './markets.js';

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
	
	// Display configuration summary
	console.log(chalk.blue('\n📋 Configuration summary:'));
	console.log(chalk.gray(`   Experiment: ${config.experimentName}`));
	console.log(chalk.gray(`   Base URL: ${config.baseUrl}`));
	console.log(chalk.gray(`   Market Group: ${config.marketGroup}`));
	console.log(chalk.gray(`   Markets: ${formatMarketCodes(config.markets)}`));
	
	// Step 2.4: Get page path selections
	console.log(chalk.blue('\n🗂  Which pages does this experiment run on?\n'));
	const pagePaths = await getPagePathSelections();
	if (pagePaths.length > 0) {
		console.log(chalk.gray(`   Page paths: ${pagePaths.map(p => p.value).join(', ')}`));
	}
	config.pagePaths = pagePaths;

	// Step 2.5: Scan for selectors
	const selectorCandidates = await scanForSelectors(cwd);
	if (selectorCandidates.length > 0) {
		console.log(chalk.blue(`\n🔍 Found ${selectorCandidates.length} selector candidate(s) in src/\n`));
	}
	const chosenSelector = await selectComponentSelector(selectorCandidates);
	config.componentSelector = chosenSelector;

	// Step 3: Generate files
	console.log(chalk.blue('\n📁 Generating test files...\n'));
	
	try {
		const { testsDir, experimentDir } = await generateTestFiles(cwd, config);
		
		const generatedFiles = getGeneratedFilesList(config.experimentName);
		generatedFiles.forEach(file => {
			console.log(chalk.green(`  ✓ ${file}`));
		});

		if (!config.runEslintOnTests) {
			const eslintResult = await addTestsToEslintIgnore(cwd);
			if (eslintResult.updated) {
				console.log(chalk.green('  ✓ Added tests/ to .eslintignore'));
			}
		}

		const gitignoreResult = await addTestOutputDirsToGitignore(cwd);
		if (gitignoreResult.updated) {
			console.log(chalk.green('  ✓ Added test output dirs to .gitignore'));
		}
		
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
		
		// Step 5: Install Playwright packages via targeted add (no full lockfile re-resolve)
		let installSucceeded = false;
		if (packageResult.packages && packageResult.packages.length > 0) {
			console.log(chalk.blue('\n📥 Installing Playwright...\n'));
			const installResult = await installDependencies(cwd, packageResult.packages);
			if (installResult.success) {
				installSucceeded = true;
				console.log(chalk.green('  ✓ Playwright installed\n'));
			} else {
				console.log(chalk.yellow(`  ⚠ ${installResult.error}`));
				console.log(chalk.gray('  Run yarn install or npm install in this directory to install Playwright.\n'));
			}
		}
		
		// Step 6: Display completion message
		console.log(chalk.green.bold('\n✓ Test structure generated successfully!\n'));
		
		const kebabName = config.experimentName.toLowerCase().replace(/\s+/g, '-');
		const marketCodes = formatMarketCodes(config.markets);

		console.log(chalk.blue('Next steps:\n'));
		let step = 1;
		if (!installSucceeded && packageResult.updated) {
			console.log(chalk.white(`  ${step}. Install dependencies:`));
			console.log(chalk.gray('     yarn install  (or npm install)\n'));
			step++;
		}
		console.log(chalk.white(`  ${step}. Build your experiment bundle:`));
		console.log(chalk.gray('     yarn build\n'));
		step++;
		console.log(chalk.white(`  ${step}. Update the locator in:`));
		console.log(chalk.gray(`     tests/e2e/${kebabName}/experiment-test.spec.js\n`));
		step++;
		console.log(chalk.white(`  ${step}. Run tests:`));
		console.log(chalk.gray('     yarn test:e2e:experiment\n'));

		console.log(chalk.blue('📖 Documentation:'));
		console.log(chalk.gray('   https://playwright.dev/docs/intro\n'));

		const runTestsNow = await confirmAction('Do you want to run tests now?');
		if (runTestsNow) {
			console.log(chalk.blue('\n🔧 Running build and tests...\n'));
			const runResult = await runBuildAndTests(cwd);
			if (!runResult.success) {
				process.exit(runResult.exitCode ?? 1);
			}
			console.log(chalk.green('\n✓ Build and tests completed.\n'));
		}
		
	} catch (error) {
		console.error(chalk.red('\n✗ Error generating test files:\n'));
		console.error(chalk.red(error.message));
		if (error.stack) {
			console.error(chalk.gray('\n' + error.stack));
		}
		process.exit(1);
	}
}
