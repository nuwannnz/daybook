import Fastify from 'fastify';
import { app } from './app';

describe('GET /health', () => {
  it('responds ok', async () => {
    const server = Fastify();
    await server.register(app);

    const response = await server.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
