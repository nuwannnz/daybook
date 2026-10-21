import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

interface FixtureCase {
  name: string;
  file: string;
  source: string;
  expectedRule: string;
}

const boundaries = '@nx/enforce-module-boundaries';

const cases: FixtureCase[] = [
  {
    name: 'domain must not import infrastructure',
    file: 'libs/shared/domain/src/lib/fixture-edge.ts',
    source:
      "import { apiInfrastructure } from '@daybook/api-infrastructure';\nexport const value = apiInfrastructure;\n",
    expectedRule: boundaries,
  },
  {
    name: 'ui must not import data-access',
    file: 'libs/ui/src/lib/fixture-edge.ts',
    source:
      "import { webDataAccess } from '@daybook/web-data-access';\nexport const value = webDataAccess;\n",
    expectedRule: boundaries,
  },
  {
    name: 'feature must not import infrastructure',
    file: 'libs/web/feature-today/src/lib/fixture-edge.ts',
    source:
      "import { apiInfrastructure } from '@daybook/api-infrastructure';\nexport const value = apiInfrastructure;\n",
    expectedRule: boundaries,
  },
  {
    name: 'application must not import infrastructure',
    file: 'libs/api/application/src/lib/fixture-edge.ts',
    source:
      "import { apiInfrastructure } from '@daybook/api-infrastructure';\nexport const value = apiInfrastructure;\n",
    expectedRule: boundaries,
  },
  {
    name: 'ui must not import @reduxjs/toolkit',
    file: 'libs/ui/src/lib/fixture-banned.ts',
    source: "import { createSlice } from '@reduxjs/toolkit';\nexport const value = createSlice;\n",
    expectedRule: boundaries,
  },
  {
    name: 'domain must not import @aws-sdk',
    file: 'libs/shared/domain/src/lib/fixture-banned.ts',
    source:
      "import { DynamoDBClient } from '@aws-sdk/client-dynamodb';\nexport const value = DynamoDBClient;\n",
    expectedRule: boundaries,
  },
  {
    name: 'single-letter variable names fail',
    file: 'libs/shared/domain/src/lib/fixture-id-length.ts',
    source: 'export const x = 1;\n',
    expectedRule: 'id-length',
  },
  {
    name: 'explicit any fails',
    file: 'libs/shared/domain/src/lib/fixture-any.ts',
    source: 'export const value: any = 1;\n',
    expectedRule: '@typescript-eslint/no-explicit-any',
  },
  {
    name: 'non-null assertion fails',
    file: 'libs/shared/domain/src/lib/fixture-non-null.ts',
    source: 'export const read = (value: string | null): string => value!;\n',
    expectedRule: '@typescript-eslint/no-non-null-assertion',
  },
  {
    name: 'floating promise fails',
    file: 'libs/shared/domain/src/lib/fixture-floating.ts',
    source: 'export const run = (): void => {\n  Promise.resolve(1);\n};\n',
    expectedRule: '@typescript-eslint/no-floating-promises',
  },
];

interface EslintResult {
  messages: { ruleId: string | null }[];
}

const root = process.cwd();
let failures = 0;

spawnSync('npx', ['nx', 'show', 'projects'], { cwd: root, stdio: 'ignore' });

for (const fixture of cases) {
  const absolute = join(root, fixture.file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, fixture.source);
  try {
    const run = spawnSync(
      'npx',
      ['eslint', '--max-warnings', '0', '--format', 'json', fixture.file],
      { cwd: root, encoding: 'utf8' },
    );
    const results = JSON.parse(run.stdout || '[]') as EslintResult[];
    const rules = results.flatMap((result) => result.messages.map((message) => message.ruleId));
    const passed = run.status !== 0 && rules.includes(fixture.expectedRule);
    console.log(`${passed ? 'ok  ' : 'FAIL'} ${fixture.name} (${fixture.expectedRule})`);
    if (!passed) {
      failures += 1;
      console.log(`     rules reported: ${rules.join(', ') || 'none'}`);
    }
  } finally {
    rmSync(absolute, { force: true });
  }
}

if (failures > 0) {
  console.error(`${failures} fixture case(s) did not fail as expected`);
  process.exit(1);
}
