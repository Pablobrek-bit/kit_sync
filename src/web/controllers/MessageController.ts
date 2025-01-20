import type { FastifyReply, FastifyRequest } from 'fastify';
import { MessagePrismaRepository } from 'repository/prisma/MessagePrismaRepository';
import { RentalPrismaRepository } from 'repository/prisma/RentalPrismaRepository';
import { CreateMessageService } from 'services/message/CreateMessageService';
import { IndexMessageService } from 'services/message/IndexMessageService';
import { z } from 'zod';

export class MessageController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const schema = z
      .object({
        text: z
          .string({ invalid_type_error: 'Text must be a string' })
          .min(1, { message: 'Text must not be empty' })
          .max(255, { message: 'Text must not exceed 255 characters' }),
        rentalId: z
          .string()
          .uuid({ message: 'Rental ID must be a valid UUID' }),
      })
      .strict();

    const paramsSchema = z.object({
      receiverId: z
        .string()
        .uuid({ message: 'Receiver ID must be a valid UUID' }),
    });

    const { text, rentalId } = schema.parse(request.body);
    const { receiverId } = paramsSchema.parse(request.params);
    const senderId = request.user.sub;

    const messageRepository = new MessagePrismaRepository();
    const rentalRepository = new RentalPrismaRepository();
    const createMessageService = new CreateMessageService(
      messageRepository,
      rentalRepository,
    );

    const { message } = await createMessageService.execute({
      receiverId,
      rentalId,
      senderId,
      text,
    });

    reply.status(201).send(message);
  }

  async getByRental(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      rentalId: z.string().uuid({ message: 'Rental ID must be a valid UUID' }),
    });

    const { rentalId } = schema.parse(request.params);

    const messageRepository = new MessagePrismaRepository();
    const rentalRepository = new RentalPrismaRepository();
    const indexMessageService = new IndexMessageService(
      messageRepository,
      rentalRepository,
    );

    const { messages } = await indexMessageService.execute({ rentalId });

    reply.send(messages);
  }

  async getMyMessages(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    const messageRepository = new MessagePrismaRepository();
    const rentalRepository = new RentalPrismaRepository();
    const indexMessageService = new IndexMessageService(
      messageRepository,
      rentalRepository,
    );

    const { messages } = await indexMessageService.execute({ userId });

    reply.send(messages);
  }
}
