import type { FastifyInstance } from 'fastify';
import { ensureAuthenticated } from 'middleware/ensureAuthenticated';
import { MessageController } from 'web/controllers/MessageController';

export async function messageRoutes(app: FastifyInstance) {
  const messageController = new MessageController();

  app.addHook('preHandler', ensureAuthenticated);

  app.post('/:receiverId', messageController.create);
  app.get('/:rentalId', messageController.getByRental);
  app.get('/me', messageController.getMyMessages);
}
