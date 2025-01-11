import type { Rental } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import type { UserRepository } from 'repository/interfaces/UserRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface CreateRentalServiceRequest {
  equipmentId: string;
  startAt: string;
  endAt: string;
  renterId: string;
  ownerId: string;
}

interface CreateRentalServiceResponse {
  rental: Rental;
}

export class CreateRentalService {
  constructor(
    private rentalRepository: RentalRepository,
    private equipmentRepository: EquipamentRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    endAt,
    equipmentId,
    renterId,
    startAt,
    ownerId,
  }: CreateRentalServiceRequest): Promise<CreateRentalServiceResponse> {
    const owner = await this.userRepository.findById(ownerId);

    if (!owner) {
      throw new InvalidArgumentError('Owner not found');
    }

    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (!equipment) {
      throw new InvalidArgumentError('Equipment not found');
    }

    if (equipment.propertyId !== renterId) {
      throw new InvalidArgumentError('You can only rent your own equipment');
    }

    if (equipment.available === false) {
      throw new InvalidArgumentError('Equipment not available');
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (startDate < new Date()) {
      throw new InvalidArgumentError(
        'Start date must be greater than the current date',
      );
    }

    if (startDate >= endDate) {
      throw new InvalidArgumentError('Invalid date range');
    }

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const total = totalDays * equipment.dailyPrice;

    const rental = await this.rentalRepository.create({
      equipmentId,
      status: 'PENDING',
      total,
      renterId,
      startAt: startDate,
      endAt: endDate,
      ownerId,
    });

    return { rental };
  }
}
