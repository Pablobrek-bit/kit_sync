import type { Equipment } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';

interface CreateEquipamentServiceRequest {
  name: string;
  description: string;
  category: string;
  dailyPrice: number;
  available?: boolean;
  photos?: string[];
  propertyId: string;
}

interface CreateEquipamentServiceResponse {
  equipament: Equipment;
}

export class CreateEquipamentService {
  constructor(private equipamentRepository: EquipamentRepository) {}

  async execute(
    data: CreateEquipamentServiceRequest,
  ): Promise<CreateEquipamentServiceResponse> {
    const equipament = await this.equipamentRepository.create(data);

    return { equipament };
  }
}
