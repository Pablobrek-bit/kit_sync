import type { EquipamentRepository } from '../../../repository/interfaces/EquipamentRepository';
import { IndexEquipmentService } from '../../../services/equipament/IndexEquipmentService';

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
  let indexEquipmentService: IndexEquipmentService;

  beforeEach(() => {
    equipamentRepositoryMock.index.mockResolvedValue([mockEquipment]);
    equipamentRepositoryMock.index.mockImplementation(async (data) => {
      const equipments = [mockEquipment];

      if (data.name) {
        return equipments.filter((equipment) => equipment.name === data.name);
      }

      if (data.category) {
        return equipments.filter(
          (equipment) => equipment.category === data.category,
        );
      }

      if (data.dailyPrice) {
        return equipments.filter(
          (equipment) => equipment.dailyPrice === data.dailyPrice,
        );
      }

      if (data.available) {
        return equipments.filter(
          (equipment) => equipment.available === data.available,
        );
      }

      return equipments;
    });

    indexEquipmentService = new IndexEquipmentService(equipamentRepositoryMock);
  });

  it('should return all equipments', async () => {
    const response = await indexEquipmentService.execute({});

    expect(response.equipments).toHaveLength(1);
  });

  it('should return equipments by name', async () => {
    const response = await indexEquipmentService.execute({ name: 'Furadeira' });

    expect(response.equipments).toHaveLength(1);
  });

  it('should return equipments by category', async () => {
    const response = await indexEquipmentService.execute({
      category: 'Ferramentas',
    });

    expect(response.equipments).toHaveLength(1);
  });

  it('should return equipments by daily price', async () => {
    const response = await indexEquipmentService.execute({ dailyPrice: 10 });

    expect(response.equipments).toHaveLength(1);
  });

  it('should return equipments by availability', async () => {
    const response = await indexEquipmentService.execute({ available: true });

    expect(response.equipments).toHaveLength(1);
  });

  it('should return empty array if no equipment is found', async () => {
    equipamentRepositoryMock.index.mockResolvedValue([]);

    const response = await indexEquipmentService.execute({});

    expect(response.equipments).toHaveLength(0);
  });

  it('should return empty array if no equipment is found by name', async () => {
    const response = await indexEquipmentService.execute({ name: 'Serra' });

    expect(response.equipments).toHaveLength(0);
  });

  it('should return empty array if no equipment is found by category', async () => {
    const response = await indexEquipmentService.execute({
      category: 'Eletrodomésticos',
    });

    expect(response.equipments).toHaveLength(0);
  });

  it('should return empty array if no equipment is found by daily price', async () => {
    const response = await indexEquipmentService.execute({ dailyPrice: 20 });

    expect(response.equipments).toHaveLength(0);
  });
});
