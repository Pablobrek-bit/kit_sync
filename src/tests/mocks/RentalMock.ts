import { RentalStatus, type Prisma, type Rental } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';

export class RentalMock {
  public rentalRepositoryMock: jest.Mocked<RentalRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    index: jest.fn(),
  };

  public idRentalExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
  public idRentalNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407z';
  public renterIdBelongsToRental = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
  public renterIdNotBelongsToRental = '4a95d2c8-7e33-4215-85f1-46bd6a3a407c';

  public mockRental: Rental = {
    id: this.idRentalExists,
    status: RentalStatus.PENDING,
    total: 10,
    endAt: new Date(),
    startAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    renterId: this.renterIdBelongsToRental,
    equipmentId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407z',
    deleteAt: null,
  };

  public constructor() {
    this.rentalRepositoryMock.index.mockImplementation(async (data) => {
      if (data.renterId === this.renterIdNotBelongsToRental) {
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

      return [this.mockRental];
    });

    this.rentalRepositoryMock.findById.mockImplementation(
      async (id: string) => {
        if (id !== this.idRentalExists) {
          return null;
        }

        return this.mockRental;
      },
    );

    this.rentalRepositoryMock.update.mockImplementation(
      async (data: Prisma.RentalUpdateInput) => {
        if (data.status) {
          if (typeof data.status === 'string') {
            this.mockRental.status = data.status as RentalStatus;
          }
        }

        if (data.startAt) {
          if (data.startAt instanceof Date) {
            this.mockRental.startAt = data.startAt;
          }
        }

        if (data.endAt) {
          if (data.endAt instanceof Date) {
            this.mockRental.endAt = data.endAt;
          }
        }

        if (data.deleteAt) {
          if (data.deleteAt instanceof Date || data.deleteAt === null) {
            this.mockRental.deleteAt = data.deleteAt;
          }
        }

        if (data.total) {
          if (typeof data.total === 'number') {
            this.mockRental.total = data.total;
          }
        }

        return this.mockRental;
      },
    );
  }
}
