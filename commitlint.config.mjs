import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const extraScopes = ['deps', 'repo', 'release', 'docs', 'planning', 'tools', 'design'];

function findProjectNames(directory) {
  const names = [];
  for (const entry of readdirSync(directory)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const path = join(directory, entry);
    if (!statSync(path).isDirectory()) continue;
    try {
      names.push(JSON.parse(readFileSync(join(path, 'project.json'), 'utf8')).name);
    } catch {
      names.push(...findProjectNames(path));
    }
  }
  return names;
}

const projectNames = ['apps', 'libs'].flatMap((root) => findProjectNames(root));

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [...projectNames, ...extraScopes]],
    'body-max-line-length': [0],
  },
};
