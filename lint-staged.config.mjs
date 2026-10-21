export default {
  '*.{ts,tsx,js,jsx,mjs,mts}': [
    'eslint --fix --max-warnings 0 --no-warn-ignored',
    'prettier --write',
  ],
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
};
