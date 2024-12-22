import { RentalStatus } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { CreateRentalService } from 'services/rental/CreateRentalService';

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

const mockRental = {
  id: '4a95d2c8-7e33-4215-85f1-46bd6a3a407e',
  status: RentalStatus.PENDING,
  total: 10,
  endAt: new Date(),
  startAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  renterId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407b',
  equipmentId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407z',
  deleteAt: null,
};

const rentalRepositoryMock: jest.Mocked<RentalRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  index: jest.fn(),
};

const equipamentRepositoryMock: jest.Mocked<EquipamentRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  index: jest.fn(),
};

describe('Create Rental Service', () => {
  let createRentalService: CreateRentalService;

  beforeEach(() => {
    rentalRepositoryMock.create.mockResolvedValue(mockRental);

    equipamentRepositoryMock.findById.mockImplementation(async (id: string) => {
      if (id !== idEquipmentExists) {
        return null;
      }

      return mockEquipment;
    });

    createRentalService = new CreateRentalService(
      rentalRepositoryMock,
      equipamentRepositoryMock,
    );
  });

  // it('should be able to create a rental', async () => {
  //   await createRentalService.execute({
  //     equipmentId: idEquipmentExists,
  //     renterId: mockRental.renterId,
  //     startAt: new Date().toISOString(),
  //     endAt: new Date().toISOString(),
  //   });

  //   expect(rentalRepositoryMock.create).toHaveBeenCalledTimes(1);
  //   expect(rentalRepositoryMock.create).toHaveBeenCalledWith({
  //     equipmentId: idEquipmentExists,
  //     renterId: mockRental.renterId,
  //     startAt: expect.any(Date),
  //     endAt: expect.any(Date),
  //     status: RentalStatus.PENDING,
  //     total: 10,
  //   });
  //   expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  // });

  it('should not be able to create a rental with invalid equipment id', async () => {
    await expect(
      createRentalService.execute({
        equipmentId: 'invalid-id',
        renterId: mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with invalid renter id', async () => {
    await expect(
      createRentalService.execute({
        equipmentId: idEquipmentExists,
        renterId: 'invalid-id',
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with invalid date range', async () => {
    await expect(
      createRentalService.execute({
        equipmentId: idEquipmentExists,
        renterId: mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with equipment not available', async () => {
    equipamentRepositoryMock.findById.mockResolvedValueOnce({
      ...mockEquipment,
      available: false,
    });

    await expect(
      createRentalService.execute({
        equipmentId: idEquipmentExists,
        renterId: mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with equipment not found', async () => {
    equipamentRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(
      createRentalService.execute({
        equipmentId: idEquipmentExists,
        renterId: mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });
});
