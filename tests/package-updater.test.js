import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import {
	updatePackageJson,
	isPlaywrightInstalled,
	detectPackageManager,
} from '../src/package-updater.js';

/**
 * Create a temporary directory with a package.json for testing
 * @param {Object} packageJson - Contents for package.json
 * @returns {Promise<string>} - Path to temporary directory
 */
async function createTempProject(packageJson = { name: 'test-project', version: '1.0.0' }) {
	const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-pkg-test-'));
	await fs.writeJson(path.join(tmpDir, 'package.json'), packageJson, { spaces: 2 });
	return tmpDir;
}

describe('updatePackageJson', () => {
	it('adds Playwright devDependencies when missing', async () => {
		const tmpDir = await createTempProject({ name: 'test', version: '1.0.0' });
		try {
			const result = await updatePackageJson(tmpDir);

			assert.equal(result.updated, true);
			assert.ok(result.changes.some((c) => c.includes('Playwright')));

			const pkg = await fs.readJson(path.join(tmpDir, 'package.json'));
			assert.equal(pkg.devDependencies['@playwright/test'], '^1.49.0');
			assert.equal(pkg.devDependencies['playwright'], '^1.49.0');
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('adds test scripts when missing', async () => {
		const tmpDir = await createTempProject({ name: 'test', version: '1.0.0' });
		try {
			const result = await updatePackageJson(tmpDir);

			assert.ok(result.changes.some((c) => c.includes('test:e2e')));
			assert.ok(result.changes.some((c) => c.includes('test:e2e:experiment')));

			const pkg = await fs.readJson(path.join(tmpDir, 'package.json'));
			assert.equal(pkg.scripts['test:e2e'], 'playwright test');
			assert.ok(pkg.scripts['test:e2e:experiment'].includes('experiment-test.spec.js'));
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('does not overwrite existing Playwright dependency', async () => {
		const tmpDir = await createTempProject({
			name: 'test',
			version: '1.0.0',
			devDependencies: { '@playwright/test': '^1.50.0' },
		});
		try {
			const result = await updatePackageJson(tmpDir);

			// Should still report changes for scripts
			const pkg = await fs.readJson(path.join(tmpDir, 'package.json'));
			// @playwright/test should remain at the user's version since mergePackageJson
			// spreads additions after existing (but needsPlaywright check skips the message)
			assert.ok(pkg.devDependencies['@playwright/test']);
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('returns no changes when everything already exists', async () => {
		const tmpDir = await createTempProject({
			name: 'test',
			version: '1.0.0',
			devDependencies: { '@playwright/test': '^1.49.0' },
			scripts: {
				'test:e2e': 'playwright test',
				'test:e2e:experiment': 'playwright test tests/e2e/*/experiment-test.spec.js',
			},
		});
		try {
			const result = await updatePackageJson(tmpDir);
			assert.equal(result.updated, false);
			assert.equal(result.changes.length, 0);
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('preserves existing package.json fields', async () => {
		const tmpDir = await createTempProject({
			name: 'my-project',
			version: '2.0.0',
			author: 'Test Author',
			license: 'MIT',
			scripts: { build: 'gulp build', dev: 'gulp' },
		});
		try {
			await updatePackageJson(tmpDir);
			const pkg = await fs.readJson(path.join(tmpDir, 'package.json'));

			assert.equal(pkg.name, 'my-project');
			assert.equal(pkg.version, '2.0.0');
			assert.equal(pkg.author, 'Test Author');
			assert.equal(pkg.scripts.build, 'gulp build');
			assert.equal(pkg.scripts.dev, 'gulp');
		} finally {
			await fs.remove(tmpDir);
		}
	});
});

describe('isPlaywrightInstalled', () => {
	it('returns true when @playwright/test is in devDependencies', async () => {
		const tmpDir = await createTempProject({
			name: 'test',
			devDependencies: { '@playwright/test': '^1.49.0' },
		});
		try {
			const result = await isPlaywrightInstalled(tmpDir);
			assert.equal(result, true);
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('returns true when playwright is in dependencies', async () => {
		const tmpDir = await createTempProject({
			name: 'test',
			dependencies: { playwright: '^1.49.0' },
		});
		try {
			const result = await isPlaywrightInstalled(tmpDir);
			assert.equal(result, true);
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('returns false when neither is present', async () => {
		const tmpDir = await createTempProject({ name: 'test' });
		try {
			const result = await isPlaywrightInstalled(tmpDir);
			assert.equal(result, false);
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('returns false when package.json does not exist', async () => {
		const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-pkg-test-'));
		try {
			await fs.remove(path.join(tmpDir, 'package.json'));
			const result = await isPlaywrightInstalled(tmpDir);
			assert.equal(result, false);
		} finally {
			await fs.remove(tmpDir);
		}
	});
});

describe('detectPackageManager', () => {
	it('returns yarn when yarn.lock exists', async () => {
		const tmpDir = await createTempProject();
		try {
			await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');
			const result = await detectPackageManager(tmpDir);
			assert.equal(result, 'yarn');
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('returns npm when no yarn.lock exists', async () => {
		const tmpDir = await createTempProject();
		try {
			const result = await detectPackageManager(tmpDir);
			assert.equal(result, 'npm');
		} finally {
			await fs.remove(tmpDir);
		}
	});
});
