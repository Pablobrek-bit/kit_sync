import type { EquipamentRepository } from '../../../repository/interfaces/EquipamentRepository';
import { CreateEquipamentService } from '../../../services/equipament/CreateEquipamentService';

const mockEquipment = {
  id: '4a95d2c8-7e33-4215-85f1-46bd6a3a407e',
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

describe('Create Equipment Service', () => {
  let createEquipmentService: CreateEquipamentService;

  beforeEach(() => {
    equipamentRepositoryMock.create.mockResolvedValue(mockEquipment);

    createEquipmentService = new CreateEquipamentService(
      equipamentRepositoryMock,
    );
  });

  it('should be able to create a new equipment', async () => {
    const { equipament } = await createEquipmentService.execute({
      name: 'Furadeira',
      description: 'Furadeira de impacto',
      category: 'Ferramentas',
      dailyPrice: 10,
      available: true,
      photos: ['https://example.com/photo.jpg'],
      propertyId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407b',
    });

    expect(equipament).toEqual(mockEquipment);
    expect(equipamentRepositoryMock.create).toHaveBeenCalledTimes(1);
  });
});
