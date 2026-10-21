import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const typescriptFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const testFiles = [
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/testing/**',
];

const sharedBans = ['@aws-sdk/*', 'fastify', 'react', 'react-dom', '@reduxjs/*'];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/.next',
      '**/vitest.config.*.timestamp*',
      '**/next-env.d.ts',
      'design/canvas',
      'cdk.out',
    ],
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({ ...config, files: typescriptFiles })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({ ...config, files: typescriptFiles })),
  {
    files: typescriptFiles,
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            { sourceTag: 'scope:api', onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'] },
            { sourceTag: 'scope:web', onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'] },
            {
              sourceTag: 'scope:infra',
              onlyDependOnLibsWithTags: ['scope:infra', 'scope:api', 'scope:shared'],
            },
            { sourceTag: 'type:domain', onlyDependOnLibsWithTags: ['type:domain'] },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: ['type:domain', 'type:contracts'],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: ['type:domain', 'type:contracts', 'type:application'],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:contracts',
                'type:application',
                'type:infrastructure',
              ],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:domain', 'type:contracts', 'type:data-access'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:contracts',
                'type:data-access',
                'type:ui',
                'type:feature',
              ],
            },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui'] },
            {
              sourceTag: 'type:e2e',
              onlyDependOnLibsWithTags: ['type:domain', 'type:contracts', 'type:app'],
            },
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:*'] },
            { sourceTag: 'type:domain', bannedExternalImports: sharedBans },
            { sourceTag: 'type:contracts', bannedExternalImports: sharedBans },
            { sourceTag: 'type:application', bannedExternalImports: sharedBans },
            {
              sourceTag: 'type:ui',
              bannedExternalImports: ['@reduxjs/*', 'react-redux', '@aws-sdk/*', 'fastify'],
            },
          ],
        },
      ],
    },
  },
  {
    files: typescriptFiles,
    rules: {
      'id-length': ['error', { min: 2, properties: 'never' }],
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: testFiles,
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-lines': 'off',
    },
  },
  {
    files: ['tools/**/*.test.mts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },
  {
    files: ['**/*.mjs', '**/*.cjs', '**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  eslintConfigPrettier,
];
