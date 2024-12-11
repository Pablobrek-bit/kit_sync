import type { EquipamentRepository } from '../../../repository/interfaces/EquipamentRepository';
import { GetEquipamentService } from '../../../services/equipament/GetEquipamentService';

const idEquipmentNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
const idEquipmentExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
const mockEquipment = {
  id: idEquipmentExists,
  name: 'Furadeira',
  description: 'Furadeira de impacto',
  category: 'Ferramentas',
  dailyPrice: 10,
  available: true,
  photos: ['https://example.com/photo.jpg'],
  propertyId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407b',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const equipamentRepositoryMock: jest.Mocked<EquipamentRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  index: jest.fn(),
};

describe('Get Equipment Service', () => {
  let getEquipmentService: GetEquipamentService;

  beforeEach(() => {
    equipamentRepositoryMock.create.mockResolvedValue(mockEquipment);

    equipamentRepositoryMock.findById.mockImplementation(async (id: string) => {
      if (id !== idEquipmentExists) {
        return null;
      }

      return mockEquipment;
    });

    getEquipmentService = new GetEquipamentService(equipamentRepositoryMock);
  });

  it('should be able to get a equipment', async () => {
    const { equipament } = await getEquipmentService.execute({
      equipamentId: idEquipmentExists,
    });

    expect(equipament).toEqual(mockEquipment);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to get a equipment that does not exists', async () => {
    await expect(
      getEquipmentService.execute({
        equipamentId: idEquipmentNotExists,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to get a equipment with invalid id', async () => {
    await expect(
      getEquipmentService.execute({
        equipamentId: 'invalid-id',
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to get a equipment with empty id', async () => {
    await expect(
      getEquipmentService.execute({
        equipamentId: '',
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });
});
