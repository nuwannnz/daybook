import assert from 'node:assert/strict';
import { test } from 'node:test';
import lint from '@commitlint/lint';
import load from '@commitlint/load';

const accepted = [
  'feat(api): add health route',
  'fix(ui): focus ring on task row',
  'docs: update testing guide',
  'chore(deps): bump nx',
  'feat(web-feature-today)!: replace carry-over banner',
];

const rejected = [
  'updated stuff',
  'Feat: Capitalised type',
  'feat(unknown-area): add something',
  'feat(api): ',
  'wip',
];

const config = await load(
  {},
  { file: new URL('../../commitlint.config.mjs', import.meta.url).pathname },
);

for (const message of accepted) {
  test(`accepts "${message}"`, async () => {
    const report = await lint(message, config.rules, {
      parserOpts: config.parserPreset?.parserOpts ?? {},
    });
    assert.equal(report.valid, true, JSON.stringify(report.errors));
  });
}

for (const message of rejected) {
  test(`rejects "${message}"`, async () => {
    const report = await lint(message, config.rules, {
      parserOpts: config.parserPreset?.parserOpts ?? {},
    });
    assert.equal(report.valid, false);
  });
}
