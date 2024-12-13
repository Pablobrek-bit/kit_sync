import type { Prisma } from '@prisma/client';
import type { EquipamentRepository } from '../../../repository/interfaces/EquipamentRepository';
import { UpdateEquipmentService } from '../../../services/equipament/UpdateEquipmentService';

const existsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
const notExistsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407f';
const propertyId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
const notPropertyId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407c';
const mockEquipment = {
  id: existsId,
  name: 'Furadeira',
  description: 'Furadeira de impacto',
  category: 'Ferramentas',
  dailyPrice: 10,
  available: true,
  photos: ['https://example.com/photo.jpg'],
  propertyId: propertyId,
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

describe('Update Equipment Service', () => {
  let updateEquipmentService: UpdateEquipmentService;

  beforeEach(() => {
    equipamentRepositoryMock.findById.mockImplementation(async (id: string) => {
      if (id !== existsId) {
        return null;
      }

      return mockEquipment;
    });

    equipamentRepositoryMock.update.mockImplementation(
      async (data: Prisma.EquipmentUpdateInput) => {
        if (data.name && typeof data.name === 'string') {
          mockEquipment.name = data.name;
        }
        if (data.description && typeof data.description === 'string') {
          mockEquipment.description = data.description;
        }

        if (data.category && typeof data.category === 'string') {
          mockEquipment.category = data.category;
        }

        if (data.dailyPrice && typeof data.dailyPrice === 'number') {
          mockEquipment.dailyPrice = data.dailyPrice;
        }

        if (typeof data.available === 'boolean') {
          mockEquipment.available = data.available;
        }

        if (data.photos && Array.isArray(data.photos)) {
          mockEquipment.photos = data.photos;
        }

        return mockEquipment;
      },
    );

    updateEquipmentService = new UpdateEquipmentService(
      equipamentRepositoryMock,
    );
  });

  it('should be able to update equipment name', async () => {
    const response = await updateEquipmentService.execute({
      id: existsId,
      userId: mockEquipment.propertyId,
      name: 'Martelo',
    });

    expect(response.equipment.name).toBe('Martelo');
  });

  it('should be able to update equipment description', async () => {
    const response = await updateEquipmentService.execute({
      id: existsId,
      userId: mockEquipment.propertyId,
      description: 'Martelo de unha',
    });

    expect(response.equipment.description).toBe('Martelo de unha');
  });

  it('should be able to update equipment category', async () => {
    const response = await updateEquipmentService.execute({
      id: existsId,
      userId: mockEquipment.propertyId,
      category: 'Ferramentas manuais',
    });

    expect(response.equipment.category).toBe('Ferramentas manuais');
  });

  it('should be able to update equipment daily price', async () => {
    const response = await updateEquipmentService.execute({
      id: existsId,
      userId: mockEquipment.propertyId,
      dailyPrice: 20,
    });

    expect(response.equipment.dailyPrice).toBe(20);
  });

  it('should be able to update equipment available', async () => {
    const response = await updateEquipmentService.execute({
      id: existsId,
      userId: mockEquipment.propertyId,
      available: false,
    });

    expect(response.equipment.available).toBe(false);
  });

  it('should be able to update equipment photos', async () => {
    const response = await updateEquipmentService.execute({
      id: existsId,
      userId: mockEquipment.propertyId,
      photos: ['https://example.com/photo2.jpg'],
    });

    expect(response.equipment.photos).toEqual([
      'https://example.com/photo2.jpg',
    ]);
  });

  it('should not be able to update equipment that does not exists', async () => {
    await expect(
      updateEquipmentService.execute({
        id: notExistsId,
        userId: mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should not be able to update equipment that is not yours', async () => {
    await expect(
      updateEquipmentService.execute({
        id: existsId,
        userId: notPropertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should not be able to update equipment with invalid id', async () => {
    await expect(
      updateEquipmentService.execute({
        id: 'invalid-id',
        userId: mockEquipment.propertyId,
      }),
    ).rejects.toBeInstanceOf(Error);
  });
});
