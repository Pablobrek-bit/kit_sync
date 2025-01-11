import type { FastifyInstance } from 'fastify';
import { ensureAuthenticated } from 'middleware/ensureAuthenticated';
import { ReviewController } from 'web/controllers/ReviewController';

export async function reviewRoutes(app: FastifyInstance) {
  app.addHook('preHandler', ensureAuthenticated);

  const reviewController = new ReviewController();

  app.post('/:rentalId', reviewController.create);
  app.get('/index/:equipmentId', reviewController.indexByEquipment);
  app.get('/me', reviewController.indexByUser);
}
