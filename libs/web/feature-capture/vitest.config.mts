import { createVitestConfig } from '../../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'web-feature-capture',
  tier: 'standard',
  environment: 'jsdom',
});
