import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { GetEquipamentService } from '../../../services/equipament/GetEquipamentService';

describe('Get Equipment Service', () => {
  let getEquipmentService: GetEquipamentService;
  let equipmentMock: EquipmentMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    getEquipmentService = new GetEquipamentService(
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should be able to get a equipment', async () => {
    const { equipament } = await getEquipmentService.execute({
      equipamentId: equipmentMock.idEquipmentExists,
    });

    expect(equipament).toEqual(equipmentMock.mockEquipment);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });

  it('should not be able to get a equipment that does not exists', async () => {
    await expect(
      getEquipmentService.execute({
        equipamentId: equipmentMock.idEquipmentNotExists,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });

  it('should not be able to get a equipment with invalid id', async () => {
    await expect(
      getEquipmentService.execute({
        equipamentId: 'invalid-id',
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });

  it('should not be able to get a equipment with empty id', async () => {
    await expect(
      getEquipmentService.execute({
        equipamentId: '',
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });
});
