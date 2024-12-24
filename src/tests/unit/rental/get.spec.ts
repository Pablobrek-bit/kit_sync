import { RentalStatus } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { GetRentalService } from 'services/rental/GetRentalService';

const idRentalExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
const idRentalNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407z';
const renterIdBelongsToRental = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
const renterIdNotBelongsToRental = '4a95d2c8-7e33-4215-85f1-46bd6a3a407c';
const mockRental: {
  id: string;
  status: RentalStatus;
  total: number;
  endAt: Date;
  startAt: Date;
  createdAt: Date;
  updatedAt: Date;
  renterId: string;
  equipmentId: string;
  deleteAt: Date | null;
} = {
  id: idRentalExists,
  status: RentalStatus.PENDING,
  total: 10,
  endAt: new Date(),
  startAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  renterId: renterIdBelongsToRental,
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

describe('Get Rental Service', () => {
  let getRentalService: GetRentalService;

  beforeEach(() => {
    rentalRepositoryMock.findById.mockImplementation(async (id: string) => {
      if (id !== idRentalExists) {
        return null;
      }

      return mockRental;
    });

    getRentalService = new GetRentalService(rentalRepositoryMock);
  });

  it('should return a rental', async () => {
    const { rental } = await getRentalService.execute({
      rentalId: idRentalExists,
      userId: mockRental.renterId,
    });

    expect(rental).toEqual(mockRental);
    expect(rentalRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if rental does not exist', async () => {
    await expect(
      getRentalService.execute({
        rentalId: idRentalNotExists,
        userId: renterIdBelongsToRental,
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should throw an error if user is not allowed to access the rental', async () => {
    await expect(
      getRentalService.execute({
        rentalId: idRentalExists,
        userId: renterIdNotBelongsToRental,
      }),
    ).rejects.toThrow('Unauthorized');
  });
});
