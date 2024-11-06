import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserPrismaRespository } from 'repository/prisma/UserPrismaRepository';
import { CreateUserService } from 'services/user/CreateUserService';
import { z } from 'zod';

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const requestSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      email: z
        .string({ required_error: 'Email is required' })
        .email({ message: 'Invalid email' }),
      password: z.string({ required_error: 'Password is required' }).min(6, {
        message: 'Password must have at least 6 characters',
      }),
    });

    const data = requestSchema.parse(request.body);

    const userRepository = new UserPrismaRespository();
    const createUserService = new CreateUserService(userRepository);

    const { user } = await createUserService.execute(data);

    return reply.code(201).send({ user });
  }
}
