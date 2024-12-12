import type { EquipamentRepository } from '../../../repository/interfaces/EquipamentRepository';
import { DeleteEquipmentService } from '../../../services/equipament/DeleteEquipmentService';

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

describe('Delete Equipment Service', () => {
  let deleteEquipmentService: DeleteEquipmentService;

  beforeEach(() => {
    equipamentRepositoryMock.findById.mockImplementation(async (id: string) => {
      if (id !== idEquipmentExists) {
        return null;
      }

      return mockEquipment;
    });

    deleteEquipmentService = new DeleteEquipmentService(
      equipamentRepositoryMock,
    );
  });

  it('should be able to delete a equipment', async () => {
    await deleteEquipmentService.execute({
      id: idEquipmentExists,
      userId: mockEquipment.propertyId,
    });

    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
    expect(equipamentRepositoryMock.delete).toHaveBeenCalledTimes(1);
  });

  it('should not be able to delete a equipment that does not exists', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: idEquipmentNotExists,
        userId: mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
    expect(equipamentRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });

  it('should not be able to delete a equipment with invalid id', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: 'invalid-id',
        userId: mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
    expect(equipamentRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });

  it('should not be able to delete a equipment with empty id', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: '',
        userId: mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
    expect(equipamentRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });

  it('should not be able to delete a equipment with invalid user id', async () => {
    await expect(
      deleteEquipmentService.execute({
        id: idEquipmentExists,
        userId: 'invalid-user-id',
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
    expect(equipamentRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });
});
