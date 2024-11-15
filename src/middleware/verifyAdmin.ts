import type { FastifyReply, FastifyRequest } from 'fastify';

export function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  const { role } = request.user;

  if (role !== 'admin') {
    reply.status(401).send({ message: 'Unauthorized' });
  }

  return;
}
