import type { Equipment, Prisma } from '@prisma/client';

export interface EquipamentRepository {
  create(data: Prisma.EquipmentUncheckedCreateInput): Promise<Equipment>;
}
