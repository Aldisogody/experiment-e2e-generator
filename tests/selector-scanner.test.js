import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { scanForSelectors } from '../src/selector-scanner.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function makeTmpDir() {
	return fs.mkdtemp(path.join(os.tmpdir(), 'selector-scanner-test-'));
}

async function writeFile(dir, relPath, content) {
	const full = path.join(dir, relPath);
	await fs.ensureDir(path.dirname(full));
	await fs.writeFile(full, content, 'utf-8');
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('scanForSelectors', () => {
	describe('Priority 1 — injected dataset markers', () => {
		it('finds [data-injected-promo] from dataset.injectedPromo assignment', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(dir, 'src/js/app.js', "dataset.injectedPromo = 'true';");
				const results = await scanForSelectors(dir);
				const values = results.map((r) => r.value);
				assert.ok(
					values.includes('[data-injected-promo]'),
					`Expected [data-injected-promo] in ${JSON.stringify(values)}`
				);
			} finally {
				await fs.remove(dir);
			}
		});

		it('assigns type 1 to injected marker results', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(dir, 'src/js/app.js', "dataset.injectedPromo = 'true';");
				const results = await scanForSelectors(dir);
				const match = results.find((r) => r.value === '[data-injected-promo]');
				assert.ok(match, 'Should find injected promo result');
				assert.equal(match.type, 1);
			} finally {
				await fs.remove(dir);
			}
		});
	});

	describe('Priority 2 — exported selector constants', () => {
		it('finds .features-kv__offer from exported SELECTOR constant', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/config.js',
					"export const OFFER_DIV_SELECTOR = '.features-kv__offer';"
				);
				const results = await scanForSelectors(dir);
				const values = results.map((r) => r.value);
				assert.ok(
					values.includes('.features-kv__offer'),
					`Expected .features-kv__offer in ${JSON.stringify(values)}`
				);
			} finally {
				await fs.remove(dir);
			}
		});

		it('assigns type 2 to exported selector constant results', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/config.js',
					"export const OFFER_DIV_SELECTOR = '.features-kv__offer';"
				);
				const results = await scanForSelectors(dir);
				const match = results.find((r) => r.value === '.features-kv__offer');
				assert.ok(match, 'Should find selector constant result');
				assert.equal(match.type, 2);
			} finally {
				await fs.remove(dir);
			}
		});
	});

	describe('Priority 3 — selectors objects', () => {
		it('finds .s-cta-price from selectors object', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/config.js',
					"const config = { selectors: { price: '.s-cta-price' } };"
				);
				const results = await scanForSelectors(dir);
				const values = results.map((r) => r.value);
				assert.ok(
					values.includes('.s-cta-price'),
					`Expected .s-cta-price in ${JSON.stringify(values)}`
				);
			} finally {
				await fs.remove(dir);
			}
		});

		it('assigns type 3 to selectors object results', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/config.js',
					"const config = { selectors: { price: '.s-cta-price' } };"
				);
				const results = await scanForSelectors(dir);
				const match = results.find((r) => r.value === '.s-cta-price');
				assert.ok(match, 'Should find selectors object result');
				assert.equal(match.type, 3);
			} finally {
				await fs.remove(dir);
			}
		});
	});

	describe('Priority 4 — querySelector calls', () => {
		it('finds .hubble-product__options-content from querySelector', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/helpers.js',
					"const el = document.querySelector('.hubble-product__options-content');"
				);
				const results = await scanForSelectors(dir);
				const values = results.map((r) => r.value);
				assert.ok(
					values.includes('.hubble-product__options-content'),
					`Expected .hubble-product__options-content in ${JSON.stringify(values)}`
				);
			} finally {
				await fs.remove(dir);
			}
		});

		it('assigns type 4 to querySelector results', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/helpers.js',
					"const el = document.querySelector('.hubble-product__options-content');"
				);
				const results = await scanForSelectors(dir);
				const match = results.find((r) => r.value === '.hubble-product__options-content');
				assert.ok(match, 'Should find querySelector result');
				assert.equal(match.type, 4);
			} finally {
				await fs.remove(dir);
			}
		});
	});

	describe('Deduplication', () => {
		it('returns a single result when the same selector appears in two files', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/config.js',
					"export const MAIN_SELECTOR = '.my-component';"
				);
				await writeFile(
					dir,
					'src/js/helpers.js',
					"export const MAIN_SELECTOR = '.my-component';"
				);
				const results = await scanForSelectors(dir);
				const matches = results.filter((r) => r.value === '.my-component');
				assert.equal(matches.length, 1, 'Duplicate selector should appear only once');
			} finally {
				await fs.remove(dir);
			}
		});
	});

	describe('Priority ordering', () => {
		it('sorts results by type ascending (type 1 before type 4)', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/helpers.js',
					"const el = document.querySelector('.low-priority');"
				);
				await writeFile(dir, 'src/js/app.js', "dataset.injectedPromo = 'true';");
				const results = await scanForSelectors(dir);
				if (results.length >= 2) {
					for (let i = 1; i < results.length; i++) {
						assert.ok(
							results[i].type >= results[i - 1].type,
							`Result at index ${i} (type ${results[i].type}) should come after index ${i - 1} (type ${results[i - 1].type})`
						);
					}
				}
			} finally {
				await fs.remove(dir);
			}
		});
	});

	describe('Empty / no-match cases', () => {
		it('returns [] when src/ directory does not exist', async () => {
			const dir = await makeTmpDir();
			try {
				const results = await scanForSelectors(dir);
				assert.deepEqual(results, []);
			} finally {
				await fs.remove(dir);
			}
		});

		it('returns [] when src/ has files but no matching patterns', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(dir, 'src/js/noop.js', 'const x = 1 + 2;');
				const results = await scanForSelectors(dir);
				assert.deepEqual(results, []);
			} finally {
				await fs.remove(dir);
			}
		});
	});

	describe('Result shape', () => {
		it('each result has value, type, file, and line fields', async () => {
			const dir = await makeTmpDir();
			try {
				await writeFile(
					dir,
					'src/js/config.js',
					"export const MAIN_SELECTOR = '.my-component';"
				);
				const results = await scanForSelectors(dir);
				assert.ok(results.length > 0, 'Should have at least one result');
				for (const result of results) {
					assert.ok('value' in result, 'Should have value field');
					assert.ok('type' in result, 'Should have type field');
					assert.ok('file' in result, 'Should have file field');
					assert.ok('line' in result, 'Should have line field');
				}
			} finally {
				await fs.remove(dir);
			}
		});
	});
});
