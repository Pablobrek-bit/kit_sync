import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface DeletePhotoEquipmentServiceRequest {
  userId: string;
  equipmentId: string;
  photoId: string;
}

export class DeletePhotoEquipmentService {
  constructor(private equipmentRepository: EquipamentRepository) {}

  async execute({
    equipmentId,
    photoId,
    userId,
  }: DeletePhotoEquipmentServiceRequest) {
    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (!equipment) {
      throw new InvalidArgumentError('Equipment not found');
    }

    if (equipment.propertyId !== userId) {
      throw new InvalidArgumentError('User does not have permission');
    }

    const photos = equipment.photos.filter((photo) => photo !== photoId);

    await this.equipmentRepository.update({
      id: equipmentId,
      photos,
    });
  }
}
