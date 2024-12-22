import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRoutes';
import { authRoutes } from './authRoutes';
import { rentalRoutes } from './rentalRoutes';
import { equipamentRoutes } from './equipamentRoutes';

export async function routes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(equipamentRoutes, { prefix: '/equipments' });
  app.register(rentalRoutes, { prefix: '/rentals' });
}
