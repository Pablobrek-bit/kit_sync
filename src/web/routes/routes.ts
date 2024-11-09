import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRoutes';
import { authRoutes } from './authRoutes';

export async function routes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
  app.register(authRoutes, { prefix: '/auth' });
}
