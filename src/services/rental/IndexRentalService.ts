import type { Rental, RentalStatus } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';

interface IndexRentalServiceRequest {
  userId: string;
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
}

interface IndexRentalServiceResponse {
  rentals: Rental[];
}

export class IndexRentalService {
  constructor(private rentalRepository: RentalRepository) {}

  async execute(
    data: IndexRentalServiceRequest,
  ): Promise<IndexRentalServiceResponse> {
    const rentals = await this.rentalRepository.index(data);

    return { rentals };
  }
}
