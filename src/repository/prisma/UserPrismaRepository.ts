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

  async findById(id: string) {
    const user = prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async update(data: Prisma.UserUpdateInput) {
    const user = await prisma.user.update({
      where: { id: data.id as string },
      data,
    });

    return user;
  }

  async delete(id: string) {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async index(data: {
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    email?: string;
    sort: 'name' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
    page: number;
    size: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (data.name) {
      where.name = {
        contains: data.name,
      };
    }

    if (data.email) {
      where.email = {
        contains: data.email,
      };
    }

    if (data.createdAt) {
      where.createdAt = {
        gte: data.createdAt,
      };
    }

    if (data.updatedAt) {
      where.updatedAt = {
        gte: data.updatedAt,
      };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        [data.sort]: data.order,
      },
      skip: (data.page - 1) * data.size,
      take: data.size,
    });

    return users;
  }
}
