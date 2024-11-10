import { FastifyRequest } from 'fastify';

export async function ensureAuthenticated(req: FastifyRequest) {
  await req.jwtVerify();
}
