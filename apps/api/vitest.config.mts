import { createVitestConfig } from '../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'api',
  tier: 'standard',
  environment: 'node',
});
