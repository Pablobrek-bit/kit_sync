Usuários:

POST /users: Criar um novo usuário. x

GET /users/{userId}: Obter informações de um usuário específico. x

PUT /users/{userId}: Atualizar informações de um usuário. x

DELETE /users/{userId}: Deletar um usuário (com as devidas precauções e verificações). x

Equipamentos:

POST /equipment: Cadastrar um novo equipamento.

GET /equipment/{equipmentId}: Obter informações de um equipamento específico.

PUT /equipment/{equipmentId}: Atualizar informações de um equipamento.

DELETE /equipment/{equipmentId}: Deletar um equipamento.

GET /equipment/search: Buscar equipamentos com filtros (tipo, localização, preço, disponibilidade, etc.).

Solicitações de Aluguel:

POST /rentals: Criar uma nova solicitação de aluguel.

GET /rentals/{rentalId}: Obter informações de uma solicitação específica.

PUT /rentals/{rentalId}: Atualizar o status de uma solicitação (aprovada, rejeitada, etc.).

GET /rentals/user/{userId}: Listar solicitações de um usuário específico (como locatário ou locador).

Mensagens:

POST /messages: Enviar uma nova mensagem.

GET /messages/conversation/{conversationId}: Obter mensagens de uma conversa específica.

Avaliações:

POST /reviews: Criar uma nova avaliação.

GET /reviews/user/{userId}: Obter avaliações de um usuário específico.
