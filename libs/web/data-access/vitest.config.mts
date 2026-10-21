import { createVitestConfig } from '../../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'web-data-access',
  tier: 'standard',
  environment: 'node',
});
