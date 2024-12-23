import type { Prisma, Rental, RentalStatus } from '@prisma/client';

export interface RentalRepository {
  create(data: Prisma.RentalUncheckedCreateInput): Promise<Rental>;

  findById(id: string): Promise<Rental | null>;

  delete(id: string): Promise<void>;

  update(data: Prisma.RentalUpdateInput): Promise<Rental>;

  index(data: {
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
  }): Promise<Rental[]>;
}
