import type { Equipment } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface UpdateEquipmentServiceRequest {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  category?: string;
  dailyPrice?: number;
  available?: boolean;
  photos?: string[];
}

interface UpdateEquipmentServiceResponse {
  equipment: Equipment;
}

export class UpdateEquipmentService {
  constructor(private equipmentRepository: EquipamentRepository) {}

  async execute(
    data: UpdateEquipmentServiceRequest,
  ): Promise<UpdateEquipmentServiceResponse> {
    const { id, userId, ...rest } = data;

    const equipment = await this.equipmentRepository.findById(id);

    if (!equipment) {
      throw new InvalidArgumentError('Equipment not found');
    }

    if (equipment.propertyId !== userId) {
      throw new Error('You are not the owner of this equipment');
    }

    const updatedEquipment = await this.equipmentRepository.update({
      id,
      ...rest,
    });

    return { equipment: updatedEquipment };
  }
}
