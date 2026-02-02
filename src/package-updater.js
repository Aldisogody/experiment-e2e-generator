import path from 'path';
import fs from 'fs-extra';
import { mergePackageJson, formatPackageJson } from './utils.js';

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
			'@playwright/test': '^1.40.0',
			'playwright': '^1.40.0',
		},
		scripts: {},
	};
	
	// Check if devDependencies need to be added
	const existingDevDeps = existingPackageJson.devDependencies || {};
	const needsPlaywright = !existingDevDeps['@playwright/test'];
	
	if (needsPlaywright) {
		changes.push('Added Playwright dependencies to devDependencies');
	}
	
	// Check if test script needs to be added
	const existingScripts = existingPackageJson.scripts || {};
	if (!existingScripts['test:e2e']) {
		additions.scripts['test:e2e'] = 'playwright test';
		changes.push('Added "test:e2e" script');
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
