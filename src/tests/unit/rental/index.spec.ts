import { RentalStatus } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { IndexRentalService } from 'services/rental/IndexRentalService';

const idRentalExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
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

describe('Index Rental Service', () => {
  let indexRentalService: IndexRentalService;

  beforeEach(() => {
    rentalRepositoryMock.index.mockImplementation(async (data) => {
      if (data.renterId === renterIdNotBelongsToRental) {
        return [];
      }

      if (data.status && data.status !== RentalStatus.PENDING) {
        return [];
      }

      if (data.totalMin && data.totalMin > 5) {
        return [];
      }

      if (data.totalMax && data.totalMax < 15) {
        return [];
      }

      if (
        data.equipmentId &&
        data.equipmentId !== '4a95d2c8-7e33-4215-85f1-46bd6a3a407z'
      ) {
        return [];
      }

      return [mockRental];
    });

    indexRentalService = new IndexRentalService(rentalRepositoryMock);
  });

  it('should return a list of rentals', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by status', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      status: RentalStatus.PENDING,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by total', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      totalMin: 5,
      totalMax: 15,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by startAt', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      startAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by endAt', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      endAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by createdAt', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      createdAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by updatedAt', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      updatedAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by equipmentId', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      equipmentId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407z',
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by page and size', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by renterId', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should return a list of rentals filtered by renterId and status', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdBelongsToRental,
      status: RentalStatus.PENDING,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([mockRental]);
  });

  it('should not return a list of rentals filtered by renterId by not belonging to the any rental', async () => {
    const response = await indexRentalService.execute({
      renterId: renterIdNotBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([]);
  });
});
