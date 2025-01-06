import type { Equipment, Prisma } from '@prisma/client';

export interface EquipamentRepository {
  create(data: Prisma.EquipmentUncheckedCreateInput): Promise<Equipment>;

  findById(id: string): Promise<Equipment | null>;

  delete(id: string): Promise<void>;

  update(data: Prisma.EquipmentUncheckedUpdateInput): Promise<Equipment>;

  index(data: {
    name?: string;
    category?: string;
    dailyPrice?: number;
    available?: boolean;
    propertyId?: string;
    page: number;
    size: number;
  }): Promise<Equipment[]>;
}
