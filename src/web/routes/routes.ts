import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRoutes';
import { authRoutes } from './authRoutes';
import { rentalRoutes } from './rentalRoutes';
import { equipamentRoutes } from './equipamentRoutes';
import { reviewRoutes } from './reviewRoutes';
import { messageRoutes } from './messageRoutes';

export async function routes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(equipamentRoutes, { prefix: '/equipments' });
  app.register(rentalRoutes, { prefix: '/rentals' });
  app.register(reviewRoutes, { prefix: '/reviews' });
  app.register(messageRoutes, { prefix: '/messages' });
}
