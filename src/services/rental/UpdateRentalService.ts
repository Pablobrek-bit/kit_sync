import type { Rental, RentalStatus } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

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
      throw new InvalidArgumentError('Rental not found');
    }

    if (rental.renterId !== userId) {
      throw new InvalidArgumentError(
        'You are not allowed to update this rental',
      );
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
        throw new InvalidArgumentError(
          'Start date must be greater than the current date',
        );
      }

      if (startAtDate > endAtDate) {
        throw new InvalidArgumentError(
          'Start date must be less than the end date',
        );
      }

      rental.startAt = startAtDate;

      rental.endAt = endAtDate;
    }

    if (startAt) {
      const startAtDate = new Date(startAt);
      const now = normalizeDate(new Date());

      if (startAtDate < now) {
        throw new InvalidArgumentError(
          'Start date must be greater than the current date',
        );
      }

      if (rental.endAt) {
        const endAtDate = normalizeDate(new Date(rental.endAt));

        if (startAtDate > endAtDate) {
          throw new InvalidArgumentError(
            'Start date must be less than the end date',
          );
        }
      }

      rental.startAt = startAtDate;
    }

    if (endAt) {
      const endAtDate = new Date(endAt);
      const now = normalizeDate(new Date());

      if (endAtDate < now) {
        throw new InvalidArgumentError(
          'End date must be greater than the current date',
        );
      }

      if (rental.startAt) {
        const startAtDate = normalizeDate(new Date(rental.startAt));

        if (endAtDate < startAtDate) {
          throw new InvalidArgumentError(
            'End date must be greater than the start date',
          );
        }
      }

      rental.endAt = endAtDate;
    }

    const newRental = await this.rentalRepository.update({
      id: rentalId,
      endAt: rental.endAt,
      startAt: rental.startAt,
      status,
    });

    return { rental: newRental };
  }
}
