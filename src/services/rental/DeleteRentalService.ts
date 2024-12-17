import type { RentalRepository } from 'repository/interfaces/RentalRepository';

interface DeleteRentalServiceRequest {
  rentalId: string;
  userId: string;
}

export class DeleteRentalService {
  constructor(private rentalRepository: RentalRepository) {}

  async execute({ rentalId, userId }: DeleteRentalServiceRequest) {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new Error('Rental not found');
    }

    if (rental.renterId !== userId) {
      throw new Error('You are not allowed to delete this rental');
    }

    await this.rentalRepository.delete(rentalId);
  }
}
