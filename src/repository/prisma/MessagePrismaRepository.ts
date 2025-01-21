import type { Prisma } from '@prisma/client';
import { prisma } from 'lib/prisma';
import type { MessageRepository } from 'repository/interfaces/MessageRepository';

export class MessagePrismaRepository implements MessageRepository {
  async create(data: Prisma.MessageUncheckedCreateInput) {
    return await prisma.message.create({ data });
  }

  async index(data: {
    rentalId?: string;
    receiverId?: string;
    senderId?: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (data.rentalId) {
      where.rentalId = data.rentalId;
    }

    if (data.receiverId) {
      where.receverId = data.receiverId;
    }

    if (data.senderId) {
      where.senderId = data.senderId;
    }

    return await prisma.message.findMany({ where });
  }
}
