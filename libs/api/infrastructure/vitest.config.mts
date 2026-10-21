import { createVitestConfig } from '../../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'api-infrastructure',
  tier: 'standard',
  environment: 'node',
});
