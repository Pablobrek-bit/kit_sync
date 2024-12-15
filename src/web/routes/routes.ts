import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRoutes';
import { authRoutes } from './authRoutes';
import { rentalRoutes } from './rentalRoutes';

export async function routes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(rentalRoutes, { prefix: '/rentals' });
}
