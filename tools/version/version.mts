import { execFileSync } from 'node:child_process';
import semver from 'semver';

export interface VersionOptions {
  cwd?: string;
  prerelease?: boolean;
}

type Bump = 'none' | 'patch' | 'minor' | 'major';

const bumpRank: Record<Bump, number> = { none: 0, patch: 1, minor: 2, major: 3 };
const subjectPattern = /^(\w+)(?:\([^)]*\))?(!)?:/;

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function latestTag(cwd: string): string | null {
  const tags = git(cwd, 'tag', '--list', 'v[0-9]*', '--merged', 'HEAD', '--sort=-v:refname');
  return tags.split('\n')[0] ?? null;
}

function bumpFor(message: string, major: number): Bump {
  const match = subjectPattern.exec(message);
  const breaking = match?.[2] === '!' || /^BREAKING[ -]CHANGE:/m.test(message);
  if (breaking) return major === 0 ? 'minor' : 'major';
  if (match?.[1] === 'feat') return 'minor';
  if (match?.[1] === 'fix' || match?.[1] === 'perf') return 'patch';
  return 'none';
}

export function computeNextVersion(options: VersionOptions = {}): string {
  const cwd = options.cwd ?? process.cwd();
  const tag = latestTag(cwd);
  const current = tag ? semver.parse(tag) : null;
  let next = '0.1.0';

  if (tag && current) {
    const messages = git(cwd, 'log', '--format=%B%x00', `${tag}..HEAD`).split('\0').filter(Boolean);
    const highest = messages
      .map((message) => bumpFor(message.trim(), current.major))
      .reduce<Bump>((best, bump) => (bumpRank[bump] > bumpRank[best] ? bump : best), 'none');
    next = highest === 'none' ? current.version : (semver.inc(current, highest) ?? current.version);
  }

  return options.prerelease ? `${next}-dev.${git(cwd, 'rev-parse', '--short', 'HEAD')}` : next;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(computeNextVersion({ prerelease: process.argv.includes('--prerelease') }));
}
