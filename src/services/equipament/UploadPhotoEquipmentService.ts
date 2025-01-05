import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface UploadPhotoEquipmentServiceRequest {
  equipmentId: string;
  photos: string[] | undefined;
  userId: string;
}

export class UploadPhotoEquipmentService {
  constructor(private equipmentRepository: EquipamentRepository) {}

  async execute({
    equipmentId,
    photos,
    userId,
  }: UploadPhotoEquipmentServiceRequest) {
    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (!equipment) {
      throw new InvalidArgumentError('Equipment not found');
    }

    if (equipment.propertyId !== userId) {
      throw new InvalidArgumentError(
        'You are not allowed to upload photos for this equipment',
      );
    }

    if (equipment.photos && photos) {
      photos = [...equipment.photos, ...photos];
    } else if (equipment.photos) {
      photos = [...equipment.photos];
    }

    await this.equipmentRepository.update({
      id: equipmentId,
      photos,
    });
  }
}
