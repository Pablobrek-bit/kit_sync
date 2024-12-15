import type { Rental } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface CreateRentalServiceRequest {
  equipmentId: string;
  startAt: string;
  endAt: string;
  renterId: string;
}

interface CreateRentalServiceResponse {
  rental: Rental;
}

export class CreateRentalService {
  constructor(
    private rentalRepository: RentalRepository,
    private equipmentRepository: EquipamentRepository,
  ) {}

  async execute({
    endAt,
    equipmentId,
    renterId,
    startAt,
  }: CreateRentalServiceRequest): Promise<CreateRentalServiceResponse> {
    // verificar se o equipamento existe
    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (!equipment) {
      throw new InvalidArgumentError('Equipment not found');
    }

    if (equipment.available === false) {
      throw new InvalidArgumentError('Equipment not available');
    }

    // verificar se a data de termino é maior que a data de inicio
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (startDate >= endDate) {
      throw new InvalidArgumentError('Invalid date range');
    }

    // calcular o total do aluguel

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const total = totalDays * equipment.dailyPrice;

    // criar o aluguel
    const rental = await this.rentalRepository.create({
      equipmentId,
      status: 'PENDING',
      total,
      renterId,
      startAt: startDate,
      endAt: endDate,
    });

    return { rental };
  }
}
