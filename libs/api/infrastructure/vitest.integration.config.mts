import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const workspaceRoot = new URL('../../../', import.meta.url).pathname;

export default defineConfig({
  root: import.meta.dirname,
  plugins: [tsconfigPaths({ root: workspaceRoot })],
  test: {
    name: 'api-infrastructure-integration',
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.spec.ts'],
    testTimeout: 30_000,
  },
});
