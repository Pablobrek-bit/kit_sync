import type { Message, Prisma } from '@prisma/client';

export interface MessageRepository {
  create(data: Prisma.MessageUncheckedCreateInput): Promise<Message>;

  index(data: {
    rentalId?: string;
    receverId?: string;
    senderId?: string;
  }): Promise<Message[]>;
}
