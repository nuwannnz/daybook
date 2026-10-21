import { createVitestConfig } from '../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'ui',
  tier: 'standard',
  environment: 'jsdom',
});
