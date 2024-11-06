import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRoutes';

export async function routes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
}
