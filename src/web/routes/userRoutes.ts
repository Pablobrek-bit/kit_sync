import { FastifyInstance } from 'fastify';
import { ensureAuthenticated } from '../../middleware/ensureAuthenticated';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import { UserController } from '../../web/controllers/UserController';

export async function userRoutes(app: FastifyInstance) {
  const userController = new UserController();

  app.post('/', userController.create);
  app.get('/', { preHandler: ensureAuthenticated }, userController.get);
  app.put('/', { preHandler: ensureAuthenticated }, userController.update);
  app.delete(
    '/:userId',
    { preHandler: [ensureAuthenticated, verifyAdmin] },
    userController.delete,
  );
  app.get('/index', { preHandler: ensureAuthenticated }, userController.index);
}
