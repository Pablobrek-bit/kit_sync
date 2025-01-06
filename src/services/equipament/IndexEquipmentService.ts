import type { Equipment } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';

interface IndexEquipmentServiceRequest {
  name?: string;
  category?: string;
  dailyPrice?: number;
  available?: boolean;
  propertyId?: string;
  page: number;
  size: number;
}

interface IndexEquipmentServiceResponse {
  equipments: Equipment[];
}

export class IndexEquipmentService {
  constructor(private equipmentRepository: EquipamentRepository) {}

  async execute(
    data: IndexEquipmentServiceRequest,
  ): Promise<IndexEquipmentServiceResponse> {
    const equipments = await this.equipmentRepository.index(data);

    return { equipments };
  }
}
