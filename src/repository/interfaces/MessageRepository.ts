import type { Message, Prisma } from '@prisma/client';

export interface MessageRepository {
  create(data: Prisma.MessageUncheckedCreateInput): Promise<Message>;
}
