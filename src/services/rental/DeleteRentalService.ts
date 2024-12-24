import { RentalStatus } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';

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
      throw new Error('Rental not found');
    }

    if (rental.renterId !== userId) {
      throw new Error('You are not allowed to delete this rental');
    }

    if (status != RentalStatus.FINISHED && status != RentalStatus.CANCELLED) {
      throw new Error(
        'You can only delete a rental with status FINISHED or CANCELLED',
      );
    }

    await this.rentalRepository.update({
      id: rentalId,
      status,
      deleteAt: new Date(),
    });
  }
}
