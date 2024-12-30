import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface DeleteEquipmentServiceRequest {
  id: string;
  userId: string;
}

export class DeleteEquipmentService {
  constructor(private equipmentRepository: EquipamentRepository) {}

  async execute({ id, userId }: DeleteEquipmentServiceRequest): Promise<void> {
    const equipament = await this.equipmentRepository.findById(id);

    if (!equipament) {
      throw new InvalidArgumentError('Equipament not found');
    }

    if (equipament.propertyId !== userId) {
      throw new InvalidArgumentError(
        'You are not allowed to delete this equipament',
      );
    }

    await this.equipmentRepository.delete(id);
  }
}
