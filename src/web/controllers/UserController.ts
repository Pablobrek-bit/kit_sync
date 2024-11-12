import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserPrismaRespository } from 'repository/prisma/UserPrismaRepository';
import { AuthService } from 'services/user/AuthService';
import { CreateUserService } from 'services/user/CreateUserService';
import { GetUserService } from 'services/user/GetUserService';
import { UpdateUserService } from 'services/user/UpdateUserService';
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

  async get(request: FastifyRequest, reply: FastifyReply) {
    const id = request.user.sub;

    const userRepository = new UserPrismaRespository();
    const getUserService = new GetUserService(userRepository);

    const { user } = await getUserService.execute({ id });

    return reply.code(200).send(user);
  }

  async auth(request: FastifyRequest, reply: FastifyReply) {
    const requestSchema = z.object({
      email: z
        .string({ required_error: 'Email is required' })
        .email({ message: 'Invalid email' }),
      password: z
        .string({ required_error: 'Password is required' })
        .min(6, { message: 'Password must have at least 6 characters' }),
    });

    const data = requestSchema.parse(request.body);

    const userRepository = new UserPrismaRespository();
    const authService = new AuthService(userRepository);

    const { user } = await authService.execute(data);

    const token = await reply.jwtSign(
      {
        sub: user.id,
        role: user.role,
      },
      {
        expiresIn: '1h',
      },
    );

    return reply.code(200).send({ user, token });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const id = request.user.sub;

    const requestSchema = z.object({
      name: z.string().optional(),
      email: z.string().email({ message: 'Invalid Email' }).optional(),
      password: z
        .string()
        .min(6, { message: 'Password must have at least 6 characters' })
        .optional(),
    });

    const data = requestSchema.parse(request.body);

    const userRepository = new UserPrismaRespository();
    const updateUserService = new UpdateUserService(userRepository);

    const updatedUser = await updateUserService.execute({ id, ...data });

    return reply.code(200).send(updatedUser);
  }
}
