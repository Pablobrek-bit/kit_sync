import type { Rental } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';

interface GetRentalServiceRequest {
  rentalId: string;
  userId: string;
}

interface GetRentalServiceResponse {
  rental: Rental;
}

export class GetRentalService {
  constructor(private rentalRepository: RentalRepository) {}

  async execute({
    rentalId,
    userId,
  }: GetRentalServiceRequest): Promise<GetRentalServiceResponse> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new Error('Rental not found');
    }

    if (rental.renterId !== userId) {
      throw new Error('Unauthorized');
    }

    return { rental };
  }
}
