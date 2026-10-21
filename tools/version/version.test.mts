import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { computeNextVersion } from './version.mts';

let repository: string;

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: repository, encoding: 'utf8' }).trim();
}

function commit(message: string): void {
  writeFileSync(join(repository, 'file.txt'), `${message}${Math.random()}`);
  git('add', '.');
  git('commit', '-q', '-m', message);
}

beforeEach(() => {
  repository = mkdtempSync(join(tmpdir(), 'daybook-version-'));
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  git('config', 'commit.gpgsign', 'false');
});

afterEach(() => {
  rmSync(repository, { recursive: true, force: true });
});

describe('computeNextVersion', () => {
  test('is 0.1.0 when there are no tags', () => {
    commit('feat(api): first');
    assert.equal(computeNextVersion({ cwd: repository }), '0.1.0');
  });

  test('a fix bumps the patch', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('fix(api): repair');
    assert.equal(computeNextVersion({ cwd: repository }), '0.1.1');
  });

  test('a feat bumps the minor', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('feat(api): add route');
    assert.equal(computeNextVersion({ cwd: repository }), '0.2.0');
  });

  test('a breaking change bumps the minor while in 0.x', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('feat(api)!: rename route');
    assert.equal(computeNextVersion({ cwd: repository }), '0.2.0');
  });

  test('a BREAKING CHANGE footer counts as breaking', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('fix(api): change shape\n\nBREAKING CHANGE: shape differs');
    assert.equal(computeNextVersion({ cwd: repository }), '0.2.0');
  });

  test('a breaking change bumps the major from 1.0.0', () => {
    commit('feat: first');
    git('tag', 'v1.0.0');
    commit('feat!: new contract');
    assert.equal(computeNextVersion({ cwd: repository }), '2.0.0');
  });

  test('docs and chore commits do not bump', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('docs: tweak');
    commit('chore(deps): bump');
    assert.equal(computeNextVersion({ cwd: repository }), '0.1.0');
  });

  test('the highest bump wins', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('fix: small');
    commit('feat: bigger');
    assert.equal(computeNextVersion({ cwd: repository }), '0.2.0');
  });

  test('prerelease appends the short sha', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('fix: small');
    const sha = git('rev-parse', '--short', 'HEAD');
    assert.equal(computeNextVersion({ cwd: repository, prerelease: true }), `0.1.1-dev.${sha}`);
  });

  test('changes no files and creates no commits or tags', () => {
    commit('feat: first');
    git('tag', 'v0.1.0');
    commit('fix: small');
    const before = git('log', '--oneline');
    computeNextVersion({ cwd: repository });
    assert.equal(git('log', '--oneline'), before);
    assert.equal(git('tag'), 'v0.1.0');
    assert.equal(git('status', '--porcelain'), '');
  });
});
