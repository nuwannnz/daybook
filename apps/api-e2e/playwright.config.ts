import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  reporter: process.env.CI ? [['github']] : 'list',
  use: { baseURL: process.env.API_URL ?? 'http://localhost:3333' },
});
