import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import {
	toKebabCase,
	replaceTemplateVars,
	mergePackageJson,
	validateProjectDirectory,
	formatPackageJson,
	detectExperimentName,
} from '../src/utils.js';

describe('toKebabCase', () => {
	it('converts spaces to hyphens', () => {
		assert.equal(toKebabCase('My Experiment Name'), 'my-experiment-name');
	});

	it('converts underscores to hyphens', () => {
		assert.equal(toKebabCase('my_experiment_name'), 'my-experiment-name');
	});

	it('converts camelCase to lowercase', () => {
		assert.equal(toKebabCase('MyExperiment'), 'myexperiment');
	});

	it('strips special characters', () => {
		assert.equal(toKebabCase('my@experiment!name'), 'myexperimentname');
	});

	it('collapses multiple hyphens', () => {
		assert.equal(toKebabCase('my--experiment---name'), 'my-experiment-name');
	});

	it('trims leading and trailing hyphens', () => {
		assert.equal(toKebabCase('-my-experiment-'), 'my-experiment');
	});

	it('handles empty string', () => {
		assert.equal(toKebabCase(''), '');
	});

	it('handles whitespace-only string', () => {
		assert.equal(toKebabCase('   '), '');
	});

	it('handles mixed separators', () => {
		assert.equal(toKebabCase('My_Experiment Name'), 'my-experiment-name');
	});
});

describe('replaceTemplateVars', () => {
	it('replaces a single variable', () => {
		const result = replaceTemplateVars('Hello {{NAME}}!', { NAME: 'World' });
		assert.equal(result, 'Hello World!');
	});

	it('replaces multiple different variables', () => {
		const template = '{{GREETING}} {{NAME}}, welcome to {{PLACE}}!';
		const vars = { GREETING: 'Hello', NAME: 'Alice', PLACE: 'Wonderland' };
		assert.equal(replaceTemplateVars(template, vars), 'Hello Alice, welcome to Wonderland!');
	});

	it('replaces repeated occurrences of the same variable', () => {
		const result = replaceTemplateVars('{{X}} and {{X}} again', { X: 'test' });
		assert.equal(result, 'test and test again');
	});

	it('leaves content unchanged when no variables match', () => {
		const result = replaceTemplateVars('No variables here', { FOO: 'bar' });
		assert.equal(result, 'No variables here');
	});

	it('leaves unmatched placeholders untouched', () => {
		const result = replaceTemplateVars('{{KNOWN}} and {{UNKNOWN}}', { KNOWN: 'yes' });
		assert.equal(result, 'yes and {{UNKNOWN}}');
	});

	it('handles empty variables object', () => {
		const result = replaceTemplateVars('{{A}} {{B}}', {});
		assert.equal(result, '{{A}} {{B}}');
	});

	it('handles empty content string', () => {
		const result = replaceTemplateVars('', { A: 'val' });
		assert.equal(result, '');
	});
});

describe('mergePackageJson', () => {
	it('merges devDependencies into existing', () => {
		const existing = { name: 'test', devDependencies: { eslint: '^8.0.0' } };
		const additions = { devDependencies: { '@playwright/test': '^1.49.0' } };
		const result = mergePackageJson(existing, additions);

		assert.equal(result.devDependencies['eslint'], '^8.0.0');
		assert.equal(result.devDependencies['@playwright/test'], '^1.49.0');
	});

	it('merges scripts without overwriting existing', () => {
		const existing = { scripts: { build: 'gulp build' } };
		const additions = { scripts: { 'test:e2e': 'playwright test' } };
		const result = mergePackageJson(existing, additions);

		assert.equal(result.scripts['build'], 'gulp build');
		assert.equal(result.scripts['test:e2e'], 'playwright test');
	});

	it('does not mutate the original object', () => {
		const existing = { name: 'test', devDependencies: { eslint: '^8.0.0' } };
		const additions = { devDependencies: { playwright: '^1.49.0' } };
		const result = mergePackageJson(existing, additions);

		assert.notEqual(result, existing);
		assert.equal(existing.devDependencies['playwright'], undefined);
	});

	it('creates devDependencies when not present in existing', () => {
		const existing = { name: 'test' };
		const additions = { devDependencies: { playwright: '^1.49.0' } };
		const result = mergePackageJson(existing, additions);

		assert.equal(result.devDependencies['playwright'], '^1.49.0');
	});

	it('handles empty additions', () => {
		const existing = { name: 'test', version: '1.0.0' };
		const result = mergePackageJson(existing, {});

		assert.deepEqual(result, existing);
		assert.notEqual(result, existing);
	});

	it('preserves all existing fields', () => {
		const existing = { name: 'test', version: '1.0.0', author: 'Test', license: 'MIT' };
		const additions = { devDependencies: { a: '1' } };
		const result = mergePackageJson(existing, additions);

		assert.equal(result.name, 'test');
		assert.equal(result.version, '1.0.0');
		assert.equal(result.author, 'Test');
		assert.equal(result.license, 'MIT');
	});
});

describe('formatPackageJson', () => {
	it('returns JSON with 2-space indentation and trailing newline', () => {
		const result = formatPackageJson({ name: 'test' });
		assert.equal(result, '{\n  "name": "test"\n}\n');
	});
});

describe('validateProjectDirectory', () => {
	it('returns valid for directory with package.json', async () => {
		const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-test-'));
		try {
			await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
			const result = await validateProjectDirectory(tmpDir);
			assert.equal(result.isValid, true);
			assert.equal(result.error, undefined);
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('returns invalid for directory without package.json', async () => {
		const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-test-'));
		try {
			const result = await validateProjectDirectory(tmpDir);
			assert.equal(result.isValid, false);
			assert.ok(result.error.includes('No package.json'));
		} finally {
			await fs.remove(tmpDir);
		}
	});
});

describe('detectExperimentName', () => {
	it('detects name from package.json', async () => {
		const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-test-'));
		try {
			await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'my-experiment' });
			const result = await detectExperimentName(tmpDir);
			assert.equal(result, 'my-experiment');
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('strips scoped package prefix', async () => {
		const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-test-'));
		try {
			await fs.writeJson(path.join(tmpDir, 'package.json'), { name: '@scope/my-experiment' });
			const result = await detectExperimentName(tmpDir);
			assert.equal(result, 'my-experiment');
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('detects name from src/components directory', async () => {
		const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-test-'));
		try {
			await fs.writeJson(path.join(tmpDir, 'package.json'), {});
			await fs.ensureDir(path.join(tmpDir, 'src', 'components'));
			await fs.writeFile(path.join(tmpDir, 'src', 'components', 'PromoCard.jsx'), '');
			const result = await detectExperimentName(tmpDir);
			assert.equal(result, 'PromoCard');
		} finally {
			await fs.remove(tmpDir);
		}
	});

	it('returns null when nothing is detectable', async () => {
		const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-test-'));
		try {
			const result = await detectExperimentName(tmpDir);
			assert.equal(result, null);
		} finally {
			await fs.remove(tmpDir);
		}
	});
});
