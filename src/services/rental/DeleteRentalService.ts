import { RentalStatus } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface DeleteRentalServiceRequest {
  rentalId: string;
  userId: string;
  status: RentalStatus;
}

export class DeleteRentalService {
  constructor(private rentalRepository: RentalRepository) {}

  async execute({ rentalId, userId, status }: DeleteRentalServiceRequest) {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new InvalidArgumentError('Rental not found');
    }

    if (rental.renterId !== userId) {
      throw new InvalidArgumentError(
        'You are not allowed to delete this rental',
      );
    }

    await this.rentalRepository.update({
      id: rentalId,
      status,
      deleteAt: new Date(),
    });
  }
}
