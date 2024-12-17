import type { Prisma } from '@prisma/client';
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
}
