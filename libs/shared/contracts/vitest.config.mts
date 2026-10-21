import { createVitestConfig } from '../../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'shared-contracts',
  tier: 'standard',
  environment: 'node',
});
