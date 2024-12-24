import type { Rental, RentalStatus } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';

interface UpdateRentalServiceRequest {
  rentalId: string;
  userId: string;
  startAt?: string;
  endAt?: string;
  status?: RentalStatus;
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
    status,
  }: UpdateRentalServiceRequest): Promise<UpdateRentalServiceResponse> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new Error('Rental not found');
    }

    if (rental.renterId !== userId) {
      throw new Error('You are not allowed to update this rental');
    }

    const normalizeDate = (date: Date) => {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      return normalizedDate;
    };

    if (startAt && endAt) {
      const startAtDate = new Date(startAt);
      const endAtDate = new Date(endAt);
      const now = normalizeDate(new Date());

      if (startAtDate < now) {
        throw new Error('Start date must be greater than the current date');
      }

      if (startAtDate > endAtDate) {
        throw new Error('Start date must be less than the end date');
      }

      rental.startAt = startAtDate;

      rental.endAt = endAtDate;
    }

    if (startAt) {
      const startAtDate = new Date(startAt);
      const now = normalizeDate(new Date());

      if (startAtDate < now) {
        throw new Error('Start date must be greater than the current date');
      }

      if (rental.endAt) {
        const endAtDate = normalizeDate(new Date(rental.endAt));

        if (startAtDate > endAtDate) {
          throw new Error('Start date must be less than the end date');
        }
      }

      rental.startAt = startAtDate;
    }

    if (endAt) {
      const endAtDate = new Date(endAt);
      const now = normalizeDate(new Date());

      if (endAtDate < now) {
        throw new Error('End date must be greater than the current date');
      }

      if (rental.startAt) {
        const startAtDate = normalizeDate(new Date(rental.startAt));
        console.log('StartAtDate:', startAtDate);

        if (endAtDate < startAtDate) {
          throw new Error('End date must be greater than the start date');
        }
      }

      rental.endAt = endAtDate;
    }

    const newRental = await this.rentalRepository.update({
      id: rentalId,
      endAt,
      startAt,
      status,
    });

    return { rental: newRental };
  }
}
