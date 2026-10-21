import { createVitestConfig } from '../../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'web-feature-today',
  tier: 'standard',
  environment: 'jsdom',
});
