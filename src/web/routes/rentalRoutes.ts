import type { FastifyInstance } from 'fastify';
import { ensureAuthenticated } from 'middleware/ensureAuthenticated';
import { RentalController } from 'web/controllers/RentalController';

export async function rentalRoutes(app: FastifyInstance) {
  const rentalController = new RentalController();

  app.addHook('preHandler', ensureAuthenticated);

  app.post('/', rentalController.create);
  app.get('/:id', rentalController.get);
  app.delete('/:id', rentalController.delete);
  app.put('/:id', rentalController.update);
  app.get('/', rentalController.index);
}
