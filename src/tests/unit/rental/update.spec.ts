import { RentalStatus, type Prisma } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { UpdateRentalService } from 'services/rental/UpdateRentalService';

const idRentalExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
const idRentalNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407z';
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

describe('Update Rental Service', () => {
  let updateRentalService: UpdateRentalService;

  beforeEach(() => {
    rentalRepositoryMock.findById.mockImplementation(async (id: string) => {
      if (id !== idRentalExists) {
        return null;
      }

      return mockRental;
    });

    rentalRepositoryMock.update.mockImplementation(
      async (data: Prisma.RentalUpdateInput) => {
        if (data.status) {
          if (typeof data.status === 'string') {
            mockRental.status = data.status as RentalStatus;
          }
        }

        if (data.startAt) {
          if (data.startAt instanceof Date) {
            mockRental.startAt = data.startAt;
          }
        }

        if (data.endAt) {
          if (data.endAt instanceof Date) {
            mockRental.endAt = data.endAt;
          }
        }

        return mockRental;
      },
    );

    updateRentalService = new UpdateRentalService(rentalRepositoryMock);
  });

  it('should update a rental', async () => {
    const { rental } = await updateRentalService.execute({
      rentalId: idRentalExists,
      userId: mockRental.renterId,
      startAt: new Date().toISOString() + 1000 * 60 * 60 * 24,
    });

    expect(rental.startAt).toBeInstanceOf(Date);
  });

  it('should throw an error if rental does not exist', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: idRentalNotExists,
        userId: mockRental.renterId,
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should throw an error if user is not allowed to update the rental', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: idRentalExists,
        userId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407c',
      }),
    ).rejects.toThrow('You are not allowed to update this rental');
  });

  it('should throw an error if start date is less than current date', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: idRentalExists,
        userId: mockRental.renterId,
        startAt: new Date(
          new Date().getTime() - 1000 * 60 * 60 * 24,
        ).toISOString(),
      }),
    ).rejects.toThrow('Start date must be greater than the current date');
  });

  it('should throw an error if start date is greater than end date', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: idRentalExists,
        userId: mockRental.renterId,
        startAt: new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24,
        ).toISOString(),
        endAt: new Date().toISOString(),
      }),
    ).rejects.toThrow('Start date must be less than the end date');
  });

  it('should throw an error if end date is less than current date', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: idRentalExists,
        userId: mockRental.renterId,
        endAt: new Date(
          new Date().getTime() - 1000 * 60 * 60 * 24,
        ).toISOString(),
      }),
    ).rejects.toThrow('End date must be greater than the current date');
  });

  it('should throw an error if end date is less than start date', async () => {
    const newEndAt = new Date(
      new Date().getTime() - 1000 * 60 * 60 * 24,
    ).toISOString();
    const newStartAt = new Date().toISOString();

    await expect(
      updateRentalService.execute({
        rentalId: idRentalExists,
        userId: mockRental.renterId,
        startAt: newStartAt,
        endAt: newEndAt,
      }),
    ).rejects.toThrow('Start date must be less than the end date');
  });

  it('should update a rental with status', async () => {
    const { rental } = await updateRentalService.execute({
      rentalId: idRentalExists,
      userId: mockRental.renterId,
      status: RentalStatus.FINISHED,
    });

    expect(rental.status).toBe(RentalStatus.FINISHED);
  });
});
