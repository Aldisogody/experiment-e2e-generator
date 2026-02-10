import path from 'path';
import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import { mergePackageJson, formatPackageJson, pathExists } from './utils.js';

/**
 * Update package.json with Playwright dependencies and scripts
 * @param {string} targetDir - Target project directory
 * @returns {Promise<{updated: boolean, changes: Array<string>}>}
 */
export async function updatePackageJson(targetDir) {
	const packageJsonPath = path.join(targetDir, 'package.json');
	const changes = [];
	
	// Read existing package.json
	const existingPackageJson = await fs.readJson(packageJsonPath);
	
	// Define additions
	const additions = {
		devDependencies: {
			'@playwright/test': '^1.49.0',
			'playwright': '^1.49.0',
		},
		scripts: {},
	};
	
	// Check if devDependencies need to be added
	const existingDevDeps = existingPackageJson.devDependencies || {};
	const needsPlaywright = !existingDevDeps['@playwright/test'];
	
	if (needsPlaywright) {
		changes.push('Added Playwright dependencies to devDependencies');
	}
	
	// Check if test scripts need to be added
	const existingScripts = existingPackageJson.scripts || {};
	if (!existingScripts['test:e2e']) {
		additions.scripts['test:e2e'] = 'playwright test';
		changes.push('Added "test:e2e" script');
	}
	if (!existingScripts['test:e2e:experiment']) {
		additions.scripts['test:e2e:experiment'] = 'playwright test tests/e2e/*/experiment-test.spec.js';
		changes.push('Added "test:e2e:experiment" script');
	}
	
	// Only update if there are changes
	if (changes.length === 0) {
		return { updated: false, changes: [] };
	}
	
	// Merge and write back
	const updatedPackageJson = mergePackageJson(existingPackageJson, additions);
	const formattedContent = formatPackageJson(updatedPackageJson);
	await fs.writeFile(packageJsonPath, formattedContent, 'utf-8');
	
	return { updated: true, changes };
}

/**
 * Check if Playwright is already installed
 * @param {string} targetDir - Target project directory
 * @returns {Promise<boolean>}
 */
export async function isPlaywrightInstalled(targetDir) {
	try {
		const packageJsonPath = path.join(targetDir, 'package.json');
		const packageJson = await fs.readJson(packageJsonPath);
		
		const deps = {
			...(packageJson.dependencies || {}),
			...(packageJson.devDependencies || {}),
		};
		
		return !!deps['@playwright/test'] || !!deps['playwright'];
	} catch {
		return false;
	}
}

/**
 * Detect which package manager the project uses
 * @param {string} targetDir - Target project directory
 * @returns {'yarn' | 'npm'}
 */
export async function detectPackageManager(targetDir) {
	const hasYarnLock = await pathExists(path.join(targetDir, 'yarn.lock'));
	return hasYarnLock ? 'yarn' : 'npm';
}

/**
 * Install dependencies in the target project (only installs what's in its package.json, e.g. Playwright)
 * @param {string} targetDir - Target project directory
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function installDependencies(targetDir) {
	const packageManager = await detectPackageManager(targetDir);
	const isWindows = process.platform === 'win32';
	const cmd = packageManager === 'yarn' ? 'yarn' : 'npm';
	const args = ['install'];
	const result = spawnSync(cmd, args, {
		cwd: targetDir,
		stdio: 'inherit',
		shell: isWindows,
	});
	if (result.status !== 0) {
		return {
			success: false,
			error: `${packageManager} install failed with exit code ${result.status}`,
		};
	}
	return { success: true };
}

/**
 * Run build (if script exists) then run experiment e2e test (test:e2e:experiment) or full test:e2e.
 * Prefers test:e2e:experiment so only experiment-test.spec.js runs; falls back to test:e2e if script missing.
 * @param {string} targetDir - Target project directory
 * @returns {Promise<{success: boolean, exitCode?: number}>}
 */
export async function runBuildAndTests(targetDir) {
	const packageJsonPath = path.join(targetDir, 'package.json');
	const packageJson = await fs.readJson(packageJsonPath);
	const scripts = packageJson.scripts || {};
	const packageManager = await detectPackageManager(targetDir);
	const isWindows = process.platform === 'win32';
	const runCmd = packageManager === 'yarn' ? 'yarn' : 'npm';

	if (scripts.build) {
		const buildResult = spawnSync(runCmd, ['run', 'build'], {
			cwd: targetDir,
			stdio: 'inherit',
			shell: isWindows,
		});
		if (buildResult.status !== 0) {
			return { success: false, exitCode: buildResult.status };
		}
	}

	const testScript = scripts['test:e2e:experiment'] ? 'test:e2e:experiment' : 'test:e2e';
	const testResult = spawnSync(runCmd, ['run', testScript], {
		cwd: targetDir,
		stdio: 'inherit',
		shell: isWindows,
	});
	if (testResult.status !== 0) {
		return { success: false, exitCode: testResult.status };
	}
	return { success: true };
}
