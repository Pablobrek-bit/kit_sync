import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserPrismaRespository } from '../../repository/prisma/UserPrismaRepository';
import { AuthService } from '../../services/user/AuthService';
import { CreateUserService } from '../../services/user/CreateUserService';
import { DeleteUserService } from '../../services/user/DeleteUserService';
import { GetUserService } from '../../services/user/GetUserService';
import { IndexUserService } from '../../services/user/IndexUserService';
import { UpdateUserService } from '../../services/user/UpdateUserService';
import { z } from 'zod';

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const requestSchema = z.object({
      name: z
        .string({
          required_error: 'Name is required',
          invalid_type_error: 'Name must be a string',
        })
        .min(3, { message: 'Name must have at least 3 characters' }),
      email: z
        .string({
          required_error: 'Email is required',
          invalid_type_error: 'Email must be a string',
        })
        .email({ message: 'Invalid email' })
        .min(3, { message: 'Email must have at least 3 characters' }),
      password: z
        .string({
          required_error: 'Password is required',
          invalid_type_error: 'Password must be a string',
        })
        .min(6, {
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
      name: z
        .string({ invalid_type_error: 'Name must to be a string' })
        .optional(),
      email: z
        .string({ invalid_type_error: 'Email must to be a string' })
        .email({ message: 'Invalid Email' })
        .optional(),
      password: z
        .string({ invalid_type_error: 'Password must to be a string' })
        .min(6, { message: 'Password must have at least 6 characters' })
        .optional(),
    });

    const data = requestSchema.parse(request.body);

    const userRepository = new UserPrismaRespository();
    const updateUserService = new UpdateUserService(userRepository);

    const { user } = await updateUserService.execute({ id, ...data });

    return reply.code(200).send(user);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      userId: z
        .string({
          message: 'User id is required',
          invalid_type_error: 'User id must be a string',
        })
        .uuid({ message: 'Invalid user id' }),
    });

    const { userId } = paramsSchema.parse(request.params);

    const id = request.user.sub;

    const userRepository = new UserPrismaRespository();
    const deleteUserService = new DeleteUserService(userRepository);

    await deleteUserService.execute({ id, userId });

    return reply.code(204).send();
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    const requestSchema = z
      .object({
        name: z
          .string({ invalid_type_error: 'Name must be a string' })
          .optional(),
        email: z
          .string({ invalid_type_error: 'Email must be a string' })
          .email({ message: 'Invalid Email' })
          .optional(),
        createdAt: z
          .string({ invalid_type_error: 'CreatedAt must be a string' })
          .optional(),
        updatedAt: z
          .string({ invalid_type_error: 'UpdatedAt must be a string' })
          .optional(),
        sort: z
          .enum(['name', 'createdAt', 'updatedAt'])
          .optional()
          .default('updatedAt'),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
        page: z.coerce
          .number({ invalid_type_error: 'Page must be a number' })
          .int({ message: 'Page must be an integer' })
          .positive({ message: 'Page must be greater than 0' })
          .optional()
          .default(1),
        size: z.coerce
          .number({ invalid_type_error: 'Size must be a number' })
          .int({ message: 'Size must be an integer' })
          .positive({ message: 'Size must be greater than 0' })
          .optional()
          .default(5),
      })
      .strict();

    const data = requestSchema.parse(request.query);

    const userRepository = new UserPrismaRespository();
    const indexUserService = new IndexUserService(userRepository);

    const { users } = await indexUserService.execute({ ...data });

    return reply.code(200).send(users);
  }
}
