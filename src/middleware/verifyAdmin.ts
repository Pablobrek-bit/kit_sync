import type { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { role } = request.user;

  if (role !== 'ADMIN') {
    reply.status(401).send({ message: 'Unauthorized' });
  }

  return;
}
