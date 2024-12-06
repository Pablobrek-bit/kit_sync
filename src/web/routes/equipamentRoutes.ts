import type { FastifyInstance } from 'fastify';
import { ensureAuthenticated } from 'middleware/ensureAuthenticated';
import { EquipamentController } from 'web/controllers/EquipamentController';

export async function equipamentRoutes(app: FastifyInstance) {
  const equipamentController = new EquipamentController();

  // post /equipament
  // get /equipament/{equipamentId}
  // put /equipament/{equipamentId}
  // delete /equipament/{equipamentId}
  // get /equipment/search
  app.addHook('preHandler', ensureAuthenticated);

  app.post('/', equipamentController.create);
  app.get('/:equipamentId', equipamentController.get);
}
