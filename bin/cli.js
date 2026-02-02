#!/usr/bin/env node

import { generator } from '../src/generator.js';

// Run the generator
generator().catch((error) => {
	console.error('Unexpected error:', error);
	process.exit(1);
});
