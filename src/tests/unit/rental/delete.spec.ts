import { RentalStatus, type Prisma } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { DeleteRentalService } from 'services/rental/DeleteRentalService';

const idRentalExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
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

describe('Delete Rental Service', () => {
  let deleteRentalService: DeleteRentalService;

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

        if (data.deleteAt) {
          if (data.deleteAt instanceof Date || data.deleteAt === null) {
            mockRental.deleteAt = data.deleteAt;
          }
        }

        return mockRental;
      },
    );

    deleteRentalService = new DeleteRentalService(rentalRepositoryMock);
  });

  it('should be able to delete a rental', async () => {
    await deleteRentalService.execute({
      rentalId: idRentalExists,
      userId: mockRental.renterId,
      status: RentalStatus.FINISHED,
    });

    expect(rentalRepositoryMock.findById).toHaveBeenCalledTimes(1);
    expect(rentalRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(rentalRepositoryMock.update).toHaveBeenCalledWith({
      id: idRentalExists,
      status: RentalStatus.FINISHED,
      deleteAt: expect.any(Date),
    });
  });

  it('should not be able to delete a rental that does not exist', async () => {
    await expect(
      deleteRentalService.execute({
        rentalId: '4a95d2c8-7e33-4215-85f1-46bd6a3a402z',
        userId: mockRental.renterId,
        status: RentalStatus.FINISHED,
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should not be able to delete a rental that does not belong to the user', async () => {
    await expect(
      deleteRentalService.execute({
        rentalId: idRentalExists,
        userId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407z',
        status: RentalStatus.FINISHED,
      }),
    ).rejects.toThrow('You are not allowed to delete this rental');
  });

  it('should not be able to delete a rental with status PENDING', async () => {
    await expect(
      deleteRentalService.execute({
        rentalId: idRentalExists,
        userId: mockRental.renterId,
        status: RentalStatus.PENDING,
      }),
    ).rejects.toThrow(
      'You can only delete a rental with status FINISHED or CANCELLED',
    );
  });

  it('should not be able to delete a rental with status ACCEPTED', async () => {
    await expect(
      deleteRentalService.execute({
        rentalId: idRentalExists,
        userId: mockRental.renterId,
        status: RentalStatus.ACCEPTED,
      }),
    ).rejects.toThrow(
      'You can only delete a rental with status FINISHED or CANCELLED',
    );
  });

  it('should not be able to delete a rental with status REJECTED', async () => {
    await expect(
      deleteRentalService.execute({
        rentalId: idRentalExists,
        userId: mockRental.renterId,
        status: RentalStatus.REJECTED,
      }),
    ).rejects.toThrow(
      'You can only delete a rental with status FINISHED or CANCELLED',
    );
  });
});
