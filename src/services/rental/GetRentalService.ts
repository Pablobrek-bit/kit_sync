import type { Rental } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

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
      throw new InvalidArgumentError('Rental not found');
    }

    if (rental.renterId !== userId && rental.ownerId !== userId) {
      throw new InvalidArgumentError('Unauthorized');
    }

    return { rental };
  }
}
