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
}
