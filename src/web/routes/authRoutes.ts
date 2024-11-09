import type { FastifyInstance } from 'fastify';
import { UserController } from 'web/controllers/UserController';

export function authRoutes(app: FastifyInstance) {
  const userController = new UserController();

  app.post('/', userController.auth);
}
