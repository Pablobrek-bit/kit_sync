import type { Prisma } from '@prisma/client';
import { prisma } from 'lib/prisma';
import type { UserRepository } from 'repository/interfaces/UserRepository';

export class UserPrismaRespository implements UserRepository {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({ data });

    return user;
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }
}
