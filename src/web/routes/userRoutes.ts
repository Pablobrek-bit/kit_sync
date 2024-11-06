import { FastifyInstance } from 'fastify';
import { UserController } from 'web/controllers/UserController';

export async function userRoutes(app: FastifyInstance) {
  // routes:
  // POST /users: Criar um novo usuário. v
  // GET /users/{userId}: Obter informações de um usuário específico.
  // PUT /users/{userId}: Atualizar informações de um usuário.
  // DELETE /users/{userId}: Deletar um usuário (com as devidas precauções e verificações).

  const userController = new UserController();

  app.post('/', userController.create);
  app.get('/:id', userController.get);
}
