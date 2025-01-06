import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { UploadPhotoEquipmentService } from '../../../services/equipament/UploadPhotoEquipmentService';

describe('Index Equipment Service', () => {
  let uploadPhotoEquipmentService: UploadPhotoEquipmentService;
  let equipmentMock: EquipmentMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    uploadPhotoEquipmentService = new UploadPhotoEquipmentService(
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should be able to upload a photo to equipment', async () => {
    const newPhoto = ['https://example'];

    await uploadPhotoEquipmentService.execute({
      equipmentId: equipmentMock.mockEquipment.id,
      userId: equipmentMock.mockEquipment.propertyId,
      photos: newPhoto,
    });

    expect(equipmentMock.mockEquipment.photos).toHaveLength(2);
    expect(equipmentMock.equipamentRepositoryMock.update).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should not be able to upload a photo to equipment that does not exist', async () => {
    await expect(
      uploadPhotoEquipmentService.execute({
        equipmentId: equipmentMock.idEquipmentNotExists,
        userId: equipmentMock.mockEquipment.propertyId,
        photos: ['https://example'],
      }),
    ).rejects.toThrow();
  });

  it('should not be able to upload a photo to equipment that does not belong to the user', async () => {
    await expect(
      uploadPhotoEquipmentService.execute({
        equipmentId: equipmentMock.mockEquipment.id,
        userId: equipmentMock.notPropertyId,
        photos: ['https://example'],
      }),
    ).rejects.toThrow();
  });
});
