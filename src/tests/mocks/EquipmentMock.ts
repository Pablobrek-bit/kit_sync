import type { Equipment, Prisma } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';

export class EquipmentMock {
  public equipamentRepositoryMock: jest.Mocked<EquipamentRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    index: jest.fn(),
  };

  public idEquipmentNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
  public idEquipmentExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
  public propertyId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
  public notPropertyId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407c';
  public mockEquipment: Equipment = {
    id: this.idEquipmentExists,
    name: 'Furadeira',
    description: 'Furadeira de impacto',
    category: 'Ferramentas',
    dailyPrice: 10,
    available: true,
    photos: ['https://example.com/photo.jpg'],
    propertyId: this.propertyId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  public constructor() {
    this.equipamentRepositoryMock.findById.mockImplementation(
      async (id: string) => {
        if (id !== this.idEquipmentExists) {
          return null;
        }

        return this.mockEquipment;
      },
    );

    this.equipamentRepositoryMock.index.mockResolvedValue([this.mockEquipment]);
    this.equipamentRepositoryMock.index.mockImplementation(async (data) => {
      const equipments = [this.mockEquipment];

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

    this.equipamentRepositoryMock.create.mockResolvedValue(this.mockEquipment);

    this.equipamentRepositoryMock.update.mockImplementation(
      async (data: Prisma.EquipmentUpdateInput) => {
        if (data.name && typeof data.name === 'string') {
          this.mockEquipment.name = data.name;
        }
        if (data.description && typeof data.description === 'string') {
          this.mockEquipment.description = data.description;
        }

        if (data.category && typeof data.category === 'string') {
          this.mockEquipment.category = data.category;
        }

        if (data.dailyPrice && typeof data.dailyPrice === 'number') {
          this.mockEquipment.dailyPrice = data.dailyPrice;
        }

        if (typeof data.available === 'boolean') {
          this.mockEquipment.available = data.available;
        }

        if (data.photos && Array.isArray(data.photos)) {
          this.mockEquipment.photos = data.photos;
        }

        return this.mockEquipment;
      },
    );
  }
}
