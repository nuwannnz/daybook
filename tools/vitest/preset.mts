import { relative } from 'node:path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export type CoverageTier = 'core' | 'standard';
export type TestEnvironment = 'node' | 'jsdom';

export interface PresetOptions {
  projectDir: string;
  name: string;
  tier?: CoverageTier;
  environment?: TestEnvironment;
}

const workspaceRoot = new URL('../../', import.meta.url).pathname;

export const coverageThresholds: Record<CoverageTier, number> = { core: 90, standard: 80 };

export function createVitestConfig(options: PresetOptions) {
  const { projectDir, name, tier = 'standard', environment = 'node' } = options;
  const relativeDir = relative(workspaceRoot, projectDir);
  const threshold = coverageThresholds[tier];
  const isDom = environment === 'jsdom';

  return defineConfig({
    root: projectDir,
    cacheDir: `${workspaceRoot}node_modules/.vite/${relativeDir}`,
    plugins: [tsconfigPaths({ root: workspaceRoot }), ...(isDom ? [react()] : [])],
    test: {
      name,
      watch: false,
      globals: true,
      environment,
      setupFiles: isDom ? [`${workspaceRoot}tools/vitest/dom-setup.mts`] : [],
      include: ['{src,tests}/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['**/*.integration.spec.ts'],
      reporters: ['default'],
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        reportsDirectory: `${workspaceRoot}coverage/${relativeDir}`,
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.spec.{ts,tsx}', 'src/**/testing/**', 'src/index.ts', 'src/main.ts'],
        thresholds: {
          lines: threshold,
          functions: threshold,
          branches: threshold,
          statements: threshold,
        },
      },
    },
  });
}
