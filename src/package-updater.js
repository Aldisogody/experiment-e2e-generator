import path from 'path';
import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import { mergePackageJson, formatPackageJson, pathExists } from './utils.js';

/**
 * Update package.json with Playwright scripts only (devDependencies are installed via targeted add command).
 * @param {string} targetDir - Target project directory
 * @returns {Promise<{updated: boolean, changes: Array<string>, packages: Array<string>}>}
 */
export async function updatePackageJson(targetDir) {
	const packageJsonPath = path.join(targetDir, 'package.json');
	const changes = [];

	const existingPackageJson = await fs.readJson(packageJsonPath);

	const existingDevDeps = existingPackageJson.devDependencies || {};
	const needsPlaywright = !existingDevDeps['@playwright/test'];
	const needsGenerator = !existingDevDeps['experiment-e2e-generator'] && !(existingPackageJson.dependencies || {})['experiment-e2e-generator'];

	if (needsPlaywright) {
		changes.push('Added Playwright dependencies to devDependencies');
	}
	if (needsGenerator) {
		changes.push('Added experiment-e2e-generator to devDependencies');
	}

	// Collect script additions only — devDependencies are handled by installDependencies
	const scriptAdditions = {};
	const existingScripts = existingPackageJson.scripts || {};
	if (!existingScripts['test:e2e']) {
		scriptAdditions['test:e2e'] = 'playwright test';
		changes.push('Added "test:e2e" script');
	}
	if (!existingScripts['test:e2e:experiment']) {
		scriptAdditions['test:e2e:experiment'] = 'playwright test tests/e2e/*/experiment-test.spec.js';
		changes.push('Added "test:e2e:experiment" script');
	}

	if (changes.length === 0) {
		return { updated: false, changes: [], packages: [] };
	}

	// Only rewrite the file when there are script additions
	if (Object.keys(scriptAdditions).length > 0) {
		const updatedPackageJson = mergePackageJson(existingPackageJson, { scripts: scriptAdditions });
		const formattedContent = formatPackageJson(updatedPackageJson);
		await fs.writeFile(packageJsonPath, formattedContent, 'utf-8');
	}

	const packages = [
		...(needsPlaywright ? ['@playwright/test@1.40.0', 'playwright@1.40.0'] : []),
		...(needsGenerator ? ['experiment-e2e-generator@latest'] : []),
	];

	return { updated: true, changes, packages };
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
 * Install specific packages into the target project without re-resolving the full lockfile.
 * Uses `yarn add --dev` or `npm install --save-dev` so only the listed packages are touched.
 * @param {string} targetDir - Target project directory
 * @param {string[]} packages - Packages to add, e.g. ['@playwright/test@1.40.0', 'playwright@1.40.0']
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function installDependencies(targetDir, packages) {
	const packageManager = await detectPackageManager(targetDir);
	const isWindows = process.platform === 'win32';
	const cmd = packageManager === 'yarn' ? 'yarn' : 'npm';
	const args = packageManager === 'yarn'
		? ['add', '--dev', ...packages]
		: ['install', '--save-dev', ...packages];
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
