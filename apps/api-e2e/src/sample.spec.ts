import { expect, test } from '@playwright/test';

test('reads the API base URL from the environment', ({ baseURL }) => {
  expect(baseURL).toBe(process.env.API_URL ?? 'http://localhost:3333');
});
