import { UpdateEquipmentService } from '../../../services/equipament/UpdateEquipmentService';
import { EquipmentMock } from 'tests/mocks/EquipmentMock';

describe('Update Equipment Service', () => {
  let updateEquipmentService: UpdateEquipmentService;
  let equipmentMock: EquipmentMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    updateEquipmentService = new UpdateEquipmentService(
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should be able to update equipment name', async () => {
    const response = await updateEquipmentService.execute({
      id: equipmentMock.idEquipmentExists,
      userId: equipmentMock.mockEquipment.propertyId,
      name: 'Martelo',
    });

    expect(response.equipment.name).toBe('Martelo');
  });

  it('should be able to update equipment description', async () => {
    const response = await updateEquipmentService.execute({
      id: equipmentMock.idEquipmentExists,
      userId: equipmentMock.mockEquipment.propertyId,
      description: 'Martelo de unha',
    });

    expect(response.equipment.description).toBe('Martelo de unha');
  });

  it('should be able to update equipment category', async () => {
    const response = await updateEquipmentService.execute({
      id: equipmentMock.idEquipmentExists,
      userId: equipmentMock.mockEquipment.propertyId,
      category: 'Ferramentas manuais',
    });

    expect(response.equipment.category).toBe('Ferramentas manuais');
  });

  it('should be able to update equipment daily price', async () => {
    const response = await updateEquipmentService.execute({
      id: equipmentMock.idEquipmentExists,
      userId: equipmentMock.mockEquipment.propertyId,
      dailyPrice: 20,
    });

    expect(response.equipment.dailyPrice).toBe(20);
  });

  it('should be able to update equipment available', async () => {
    const response = await updateEquipmentService.execute({
      id: equipmentMock.idEquipmentExists,
      userId: equipmentMock.mockEquipment.propertyId,
      available: false,
    });

    expect(response.equipment.available).toBe(false);
  });

  it('should be able to update equipment photos', async () => {
    const response = await updateEquipmentService.execute({
      id: equipmentMock.idEquipmentExists,
      userId: equipmentMock.mockEquipment.propertyId,
      photos: ['https://example.com/photo2.jpg'],
    });

    expect(response.equipment.photos).toEqual([
      'https://example.com/photo2.jpg',
    ]);
  });

  it('should not be able to update equipment that does not exists', async () => {
    await expect(
      updateEquipmentService.execute({
        id: equipmentMock.idEquipmentNotExists,
        userId: equipmentMock.mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should not be able to update equipment that is not yours', async () => {
    await expect(
      updateEquipmentService.execute({
        id: equipmentMock.idEquipmentExists,
        userId: equipmentMock.notPropertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should not be able to update equipment with invalid id', async () => {
    await expect(
      updateEquipmentService.execute({
        id: 'invalid-id',
        userId: equipmentMock.mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
  });
});
