import type { Prisma, RentalStatus } from '@prisma/client';
import { prisma } from 'lib/prisma';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';

export class RentalPrismaRepository implements RentalRepository {
  async create(data: Prisma.RentalUncheckedCreateInput) {
    const rental = await prisma.rental.create({ data });

    return rental;
  }

  async findById(id: string) {
    const rental = await prisma.rental.findUnique({
      where: { id },
    });

    return rental;
  }

  async delete(id: string) {
    await prisma.rental.delete({
      where: { id },
    });
  }

  async update(data: Prisma.RentalUpdateInput) {
    const rental = await prisma.rental.update({
      where: { id: data.id as string },
      data,
    });

    return rental;
  }

  async index(data: {
    renterId: string;
    status?: RentalStatus;
    totalMin?: number;
    totalMax?: number;
    startAt?: string;
    endAt?: string;
    createdAt?: string;
    updatedAt?: string;
    equipmentId?: string;
    page: number;
    size: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (data.status) {
      where.status = data.status;
    }

    if (data.totalMin) {
      where.total = {
        gte: data.totalMin,
      };
    }

    if (data.totalMax) {
      where.total = {
        lte: data.totalMax,
      };
    }

    if (data.startAt) {
      where.startAt = {
        gte: new Date(data.startAt),
      };
    }

    if (data.endAt) {
      where.endAt = {
        lte: new Date(data.endAt),
      };
    }

    if (data.createdAt) {
      where.createdAt = {
        gte: new Date(data.createdAt),
      };
    }

    if (data.updatedAt) {
      where.updatedAt = {
        gte: new Date(data.updatedAt),
      };
    }

    if (data.equipmentId) {
      where.equipmentId = data.equipmentId;
    }

    const rentals = await prisma.rental.findMany({
      where: {
        ...where,
        renterId: data.renterId,
      },
      skip: data.page ? (data.page - 1) * data.size : undefined,
      take: data.size,
    });

    return rentals;
  }
}
