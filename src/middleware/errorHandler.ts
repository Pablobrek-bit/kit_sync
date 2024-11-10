import { Prisma } from '@prisma/client';
import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export const errorHandler = (
  error: FastifyError,
  req: FastifyRequest,
  rep: FastifyReply,
): void => {
  if (error instanceof ZodError) {
    console.error(error);
    rep
      .status(400)
      .send({ message: 'Validation error', issues: error.format() });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(error);
    rep.status(400).send({ message: error.message });
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error(error);
    rep.status(500).send({ message: 'Internal server error' });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error(error);
    rep.status(500).send({ message: error.message });
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    console.error(error);
    rep.status(400).send({ message: error.message });
  }

  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    console.error(error);
    rep.status(401).send({ message: 'Authorization header is missing' });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(error);
    rep.status(400).send({ message: error.message });
  }

  if (error instanceof Error) {
    console.error(error);
    rep.status(500).send({ message: 'Internal server error' });
  }
};
