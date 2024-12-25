import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { DeleteEquipmentService } from '../../../services/equipament/DeleteEquipmentService';

describe('Delete Equipment Service', () => {
  let deleteEquipmentService: DeleteEquipmentService;
  let equipmentMock: EquipmentMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    deleteEquipmentService = new DeleteEquipmentService(
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should be able to delete a equipment', async () => {
    await deleteEquipmentService.execute({
      id: equipmentMock.idEquipmentExists,
      userId: equipmentMock.mockEquipment.propertyId,
    });

    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
    expect(equipmentMock.equipamentRepositoryMock.delete).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should not be able to delete a equipment that does not exists', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: equipmentMock.idEquipmentNotExists,
        userId: equipmentMock.mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
    expect(equipmentMock.equipamentRepositoryMock.delete).toHaveBeenCalledTimes(
      0,
    );
  });

  it('should not be able to delete a equipment with invalid id', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: 'invalid-id',
        userId: equipmentMock.mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
    expect(equipmentMock.equipamentRepositoryMock.delete).toHaveBeenCalledTimes(
      0,
    );
  });

  it('should not be able to delete a equipment with empty id', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: '',
        userId: equipmentMock.mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
    expect(equipmentMock.equipamentRepositoryMock.delete).toHaveBeenCalledTimes(
      0,
    );
  });

  it('should not be able to delete a equipment with invalid user id', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: equipmentMock.idEquipmentExists,
        userId: 'invalid-user-id',
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
    expect(equipmentMock.equipamentRepositoryMock.delete).toHaveBeenCalledTimes(
      0,
    );
  });
});
