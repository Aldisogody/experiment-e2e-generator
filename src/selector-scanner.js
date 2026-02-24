import path from 'path';
import fs from 'fs-extra';

/**
 * Convert a camelCase dataset property name to a kebab-case data attribute selector.
 * e.g. "injectedPromo" -> "[data-injected-promo]"
 * @param {string} camelProp
 * @returns {string}
 */
function datasetPropToSelector(camelProp) {
	const kebab = camelProp.replace(/([A-Z])/g, (_, c) => `-${c.toLowerCase()}`);
	return `[data-${kebab}]`;
}

/**
 * Walk src/ directory and collect all .js/.jsx/.ts/.tsx file paths.
 * @param {string} srcDir
 * @returns {Promise<string[]>}
 */
async function collectSourceFiles(srcDir) {
	if (!(await fs.pathExists(srcDir))) {
		return [];
	}

	const entries = await fs.readdir(srcDir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(srcDir, entry.name);
		if (entry.isDirectory()) {
			const nested = await collectSourceFiles(fullPath);
			files.push(...nested);
		} else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Count the number of newlines before a given character index in a string.
 * Returns 1-based line number.
 * @param {string} content
 * @param {number} index
 * @returns {number}
 */
function lineNumberAt(content, index) {
	let line = 1;
	for (let i = 0; i < index; i++) {
		if (content[i] === '\n') line++;
	}
	return line;
}

/**
 * Scan a project's src/ directory for CSS selectors used in experiment code.
 *
 * Four priority passes:
 *  1. Injected dataset markers  (dataset.injectedXxx = ...)
 *  2. Exported selector constants (export const FOO_SELECTOR = '...')
 *  3. Selectors objects  (selectors: { key: '.foo' })
 *  4. document.querySelector calls
 *
 * @param {string} projectDir - Root directory of the target project
 * @returns {Promise<Array<{value: string, type: number, file: string, line: number}>>}
 *          Sorted by type ascending, deduplicated by value.
 */
export async function scanForSelectors(projectDir) {
	const srcDir = path.join(projectDir, 'src');
	const files = await collectSourceFiles(srcDir);

	/** @type {Array<{value: string, type: number, file: string, line: number}>} */
	const found = [];
	const seen = new Set();

	for (const filePath of files) {
		const content = await fs.readFile(filePath, 'utf-8');

		// Pass 1: dataset.injectedXxx assignments → [data-injected-xxx]
		const datasetPattern = /dataset\.([A-Za-z]+)\s*=/g;
		let m;
		while ((m = datasetPattern.exec(content)) !== null) {
			const prop = m[1];
			// Only match properties containing "injected" (case-insensitive)
			if (/injected/i.test(prop)) {
				const value = datasetPropToSelector(prop);
				if (!seen.has(value)) {
					seen.add(value);
					found.push({ value, type: 1, file: filePath, line: lineNumberAt(content, m.index) });
				}
			}
		}

		// Pass 2: export const FOO_SELECTOR = '...' or export const SELECTOR_BAR = '...'
		const exportedSelectorPattern = /export\s+const\s+[A-Z_]*SELECTOR[A-Z_]*\s*=\s*['"]([^'"]+)['"]/gm;
		while ((m = exportedSelectorPattern.exec(content)) !== null) {
			const value = m[1];
			if (!seen.has(value)) {
				seen.add(value);
				found.push({ value, type: 2, file: filePath, line: lineNumberAt(content, m.index) });
			}
		}

		// Pass 3: selectors: { key: '.foo', key2: '#bar' }
		const selectorsBlockPattern = /selectors\s*:\s*\{([^}]+)\}/gms;
		while ((m = selectorsBlockPattern.exec(content)) !== null) {
			const block = m[1];
			const blockStart = m.index;
			const valuePattern = /['"]([.#[][^'"]{2,})['"]/g;
			let vm;
			while ((vm = valuePattern.exec(block)) !== null) {
				const value = vm[1];
				if (!seen.has(value)) {
					seen.add(value);
					found.push({ value, type: 3, file: filePath, line: lineNumberAt(content, blockStart + vm.index) });
				}
			}
		}

		// Pass 4: document.querySelector('...')
		const querySelectorPattern = /document\.querySelector\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
		while ((m = querySelectorPattern.exec(content)) !== null) {
			const value = m[1];
			if (!seen.has(value)) {
				seen.add(value);
				found.push({ value, type: 4, file: filePath, line: lineNumberAt(content, m.index) });
			}
		}
	}

	return found.sort((a, b) => a.type - b.type);
}
