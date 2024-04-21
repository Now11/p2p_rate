import { defineConfig } from '@playwright/test';

defineConfig({
	use: {
		headless: process.env.CI ? true : false,
		channel: 'chrome',
		viewport: { width: 1600, height: 960 },
	},
	testMatch: 'test/rate.test.js',
});
