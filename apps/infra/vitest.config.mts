import { createVitestConfig } from '../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'infra',
  tier: 'standard',
  environment: 'node',
});
