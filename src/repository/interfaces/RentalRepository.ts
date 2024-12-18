import type { Prisma, Rental } from '@prisma/client';

export interface RentalRepository {
  create(data: Prisma.RentalUncheckedCreateInput): Promise<Rental>;

  findById(id: string): Promise<Rental | null>;

  delete(id: string): Promise<void>;

  update(data: Prisma.RentalUpdateInput): Promise<Rental>;
}
