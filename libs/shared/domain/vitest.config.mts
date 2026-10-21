import { createVitestConfig } from '../../../tools/vitest/preset.mts';

export default createVitestConfig({
  projectDir: import.meta.dirname,
  name: 'shared-domain',
  tier: 'core',
  environment: 'node',
});
