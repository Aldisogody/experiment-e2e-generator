import fs from 'fs-extra';
import path from 'path';

/**
 * Convert string to kebab-case
 * @param {string} str - Input string
 * @returns {string} - kebab-case string
 */
export function toKebabCase(str) {
	return str
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

/**
 * Replace template variables in content
 * @param {string} content - Template content
 * @param {Object} variables - Variables to replace
 * @returns {string} - Content with replaced variables
 */
export function replaceTemplateVars(content, variables) {
	let result = content;
	
	Object.entries(variables).forEach(([key, value]) => {
		const placeholder = new RegExp(`{{${key}}}`, 'g');
		result = result.replace(placeholder, value);
	});
	
	return result;
}

/**
 * Check if a path exists
 * @param {string} targetPath - Path to check
 * @returns {Promise<boolean>}
 */
export async function pathExists(targetPath) {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

/**
 * Safely merge package.json dependencies
 * @param {Object} existing - Existing package.json content
 * @param {Object} additions - New dependencies to add
 * @returns {Object} - Merged package.json
 */
export function mergePackageJson(existing, additions) {
	const merged = { ...existing };
	
	// Merge devDependencies
	if (additions.devDependencies) {
		merged.devDependencies = {
			...merged.devDependencies,
			...additions.devDependencies,
		};
	}
	
	// Merge scripts (don't overwrite existing)
	if (additions.scripts) {
		merged.scripts = {
			...merged.scripts,
			...additions.scripts,
		};
	}
	
	return merged;
}

/**
 * Attempt to detect experiment name from project structure
 * @param {string} cwd - Current working directory
 * @returns {Promise<string|null>} - Detected experiment name or null
 */
export async function detectExperimentName(cwd) {
	try {
		// Try to read package.json
		const packageJsonPath = path.join(cwd, 'package.json');
		if (await pathExists(packageJsonPath)) {
			const packageJson = await fs.readJson(packageJsonPath);
			if (packageJson.name) {
				// Extract experiment name from package name
				const name = packageJson.name.replace(/^@[^/]+\//, '');
				return name;
			}
		}
		
		// Try to find experiment folder structure
		const srcPath = path.join(cwd, 'src');
		if (await pathExists(srcPath)) {
			const componentsPath = path.join(srcPath, 'components');
			if (await pathExists(componentsPath)) {
				const components = await fs.readdir(componentsPath);
				if (components.length > 0) {
					// Use first component name as experiment name
					return components[0].replace(/\.(jsx?|tsx?)$/, '');
				}
			}
		}
	} catch (error) {
		// Ignore detection errors
	}
	
	return null;
}

/**
 * Format package.json content with proper indentation
 * @param {Object} content - Package.json object
 * @returns {string} - Formatted JSON string
 */
export function formatPackageJson(content) {
	return JSON.stringify(content, null, 2) + '\n';
}

/**
 * Validate that current directory is a valid project
 * @param {string} cwd - Current working directory
 * @returns {Promise<{isValid: boolean, error?: string}>}
 */
export async function validateProjectDirectory(cwd) {
	// Check if package.json exists
	const packageJsonPath = path.join(cwd, 'package.json');
	if (!await pathExists(packageJsonPath)) {
		return {
			isValid: false,
			error: 'No package.json found in current directory. Please run this command from your project root.',
		};
	}
	
	return { isValid: true };
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
export async function ensureDir(dirPath) {
	await fs.ensureDir(dirPath);
}

/**
 * Copy file with template variable replacement
 * @param {string} sourcePath - Source file path
 * @param {string} destPath - Destination file path
 * @param {Object} variables - Template variables
 */
export async function copyTemplateFile(sourcePath, destPath, variables) {
	const content = await fs.readFile(sourcePath, 'utf-8');
	const processedContent = replaceTemplateVars(content, variables);
	await ensureDir(path.dirname(destPath));
	await fs.writeFile(destPath, processedContent, 'utf-8');
}
