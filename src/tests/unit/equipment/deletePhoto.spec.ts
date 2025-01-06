import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { DeletePhotoEquipmentService } from '../../../services/equipament/DeletePhotoEquipmentService';

describe('Index Equipment Service', () => {
  let deletePhotoEquipmentService: DeletePhotoEquipmentService;
  let equipmentMock: EquipmentMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    deletePhotoEquipmentService = new DeletePhotoEquipmentService(
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should be able to delete a photo from equipment', async () => {
    await deletePhotoEquipmentService.execute({
      equipmentId: equipmentMock.mockEquipment.id,
      userId: equipmentMock.mockEquipment.propertyId,
      photoId: equipmentMock.mockEquipment.photos[0],
    });

    expect(equipmentMock.mockEquipment.photos).toHaveLength(0);
    expect(equipmentMock.equipamentRepositoryMock.update).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should not be able to delete a photo from equipment that does not exist', async () => {
    await expect(
      deletePhotoEquipmentService.execute({
        equipmentId: equipmentMock.idEquipmentNotExists,
        userId: equipmentMock.mockEquipment.propertyId,
        photoId: equipmentMock.mockEquipment.photos[0],
      }),
    ).rejects.toThrow();
  });

  it('should not be able to delete a photo from equipment that does not belong to the user', async () => {
    await expect(
      deletePhotoEquipmentService.execute({
        equipmentId: equipmentMock.mockEquipment.id,
        userId: equipmentMock.notPropertyId,
        photoId: equipmentMock.mockEquipment.photos[0],
      }),
    ).rejects.toThrow();
  });

  it('should not be able to delete a photo that does not exist', async () => {
    await expect(
      deletePhotoEquipmentService.execute({
        equipmentId: equipmentMock.mockEquipment.id,
        userId: equipmentMock.mockEquipment.propertyId,
        photoId: 'photo.jpg',
      }),
    ).rejects.toThrow();
  });
});
