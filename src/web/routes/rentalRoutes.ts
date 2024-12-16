import type { FastifyInstance } from 'fastify';
import { ensureAuthenticated } from 'middleware/ensureAuthenticated';
import { RentalController } from 'web/controllers/RentalController';

export async function rentalRoutes(app: FastifyInstance) {
  // POST /equipment: Cadastrar um novo equipamento.
  // GET /equipment/{equipmentId}: Obter informações de um equipamento específico.
  // PUT /equipment/{equipmentId}: Atualizar informações de um equipamento.
  // DELETE /equipment/{equipmentId}: Deletar um equipamento.
  // GET /equipment/search: Buscar equipamentos com filtros (tipo, localização, preço, disponibilidade, etc.)

  const rentalController = new RentalController();

  app.addHook('preHandler', ensureAuthenticated);

  app.post('/', rentalController.create);
  app.get('/:id', rentalController.get);
}
