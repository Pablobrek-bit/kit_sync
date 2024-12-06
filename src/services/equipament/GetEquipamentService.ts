import type { Equipment } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface GetEquipamentServiceRequest {
  equipamentId: string;
}

interface GetEquipamentServiceResponse {
  equipament: Equipment;
}

export class GetEquipamentService {
  constructor(private equipmentRepository: EquipamentRepository) {}

  async execute({
    equipamentId,
  }: GetEquipamentServiceRequest): Promise<GetEquipamentServiceResponse> {
    const equipament = await this.equipmentRepository.findById(equipamentId);

    if (!equipament) {
      throw new InvalidArgumentError('Equipment with this id does not exists');
    }

    return { equipament };
  }
}
