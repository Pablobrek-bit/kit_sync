import type { Prisma } from '@prisma/client';
import { prisma } from 'lib/prisma';
import type { MessageRepository } from 'repository/interfaces/MessageRepository';

export class MessagePrismaRepository implements MessageRepository {
  async create(data: Prisma.MessageUncheckedCreateInput) {
    return prisma.message.create({ data });
  }
}
