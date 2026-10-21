import { createVitestConfig } from '../../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'web-editor',
  tier: 'standard',
  environment: 'jsdom',
});
