import type { FastifyInstance } from 'fastify';
import { ensureAuthenticated } from 'middleware/ensureAuthenticated';
import { EquipamentController } from 'web/controllers/EquipamentController';

export async function equipamentRoutes(app: FastifyInstance) {
  const equipamentController = new EquipamentController();

  // post /equipament x
  // get /equipament/{equipamentId} x
  // put /equipament/{equipamentId}
  // delete /equipament/{equipamentId} x
  // get /equipment/search
  app.addHook('preHandler', ensureAuthenticated);

  app.post('/', equipamentController.create);
  app.get('/:equipamentId', equipamentController.get);
  app.delete('/:equipamentId', equipamentController.delete);
  app.put('/:equipamentId', equipamentController.update);
}
