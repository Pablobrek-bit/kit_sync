import type { Prisma } from '@prisma/client';
import { prisma } from 'lib/prisma';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';

export class EquipmentPrismaRepository implements EquipamentRepository {
  async create(data: Prisma.EquipmentUncheckedCreateInput) {
    const equipament = await prisma.equipment.create({ data });

    return equipament;
  }

  async findById(id: string) {
    const equipament = await prisma.equipment.findUnique({
      where: { id },
    });

    return equipament;
  }

  async delete(id: string) {
    await prisma.equipment.delete({
      where: { id },
    });
  }

  async update(data: Prisma.EquipmentUncheckedUpdateInput) {
    const { id, ...rest } = data;

    if (typeof id !== 'string') {
      throw new Error('Invalid id type');
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: rest,
    });

    return updatedEquipment;
  }

  async index(data: {
    name?: string;
    category?: string;
    dailyPrice?: number;
    available?: boolean;
    page: number;
    size: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (data.name) {
      where.name = { contains: data.name };
    }

    if (data.category) {
      where.category = { contains: data.category };
    }

    if (data.dailyPrice) {
      where.dailyPrice = data.dailyPrice;
    }

    if (data.available) {
      where.available = data.available;
    }

    const equipments = await prisma.equipment.findMany({
      where,
      skip: (data.page - 1) * data.size,
    });

    return equipments;
  }
}
