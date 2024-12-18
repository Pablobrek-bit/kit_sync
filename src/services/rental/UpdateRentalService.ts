import type { Rental } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';

interface UpdateRentalServiceRequest {
  rentalId: string;
  userId: string;
  startAt?: string;
  endAt?: string;
}

interface UpdateRentalServiceResponse {
  rental: Rental;
}

export class UpdateRentalService {
  constructor(private rentalRepository: RentalRepository) {}

  async execute({
    rentalId,
    userId,
    endAt,
    startAt,
  }: UpdateRentalServiceRequest): Promise<UpdateRentalServiceResponse> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new Error('Rental not found');
    }

    if (rental.renterId !== userId) {
      throw new Error('You are not allowed to update this rental');
    }

    if (startAt) {
      rental.startAt = new Date(startAt);
    }

    if (endAt) {
      rental.endAt = new Date(endAt);
    }

    const newRental = await this.rentalRepository.update({
      id: rentalId,
      endAt,
      startAt,
    });

    return { rental: newRental };
  }
}
