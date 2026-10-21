import type { FastifyInstance } from 'fastify';

export function app(server: FastifyInstance): Promise<void> {
  server.get('/health', () => ({ status: 'ok' }));
  return Promise.resolve();
}
