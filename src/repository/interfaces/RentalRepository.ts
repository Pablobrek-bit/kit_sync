import type { Prisma, Rental } from '@prisma/client';

export interface RentalRepository {
  create(data: Prisma.RentalUncheckedCreateInput): Promise<Rental>;
}
