import { RentalStatus } from '@prisma/client';
import { UpdateRentalService } from 'services/rental/UpdateRentalService';
import { RentalMock } from 'tests/mocks/RentalMock';

describe('Update Rental Service', () => {
  let updateRentalService: UpdateRentalService;
  let rentalMock: RentalMock;

  beforeEach(() => {
    rentalMock = new RentalMock();
    updateRentalService = new UpdateRentalService(
      rentalMock.rentalRepositoryMock,
    );
  });

  it('should update a rental', async () => {
    const { rental } = await updateRentalService.execute({
      rentalId: rentalMock.idRentalExists,
      userId: rentalMock.mockRental.renterId,
      startAt: new Date().toISOString() + 1000 * 60 * 60 * 24,
    });

    expect(rental.startAt).toBeInstanceOf(Date);
  });

  it('should throw an error if rental does not exist', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: rentalMock.idRentalNotExists,
        userId: rentalMock.mockRental.renterId,
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should throw an error if user is not allowed to update the rental', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: rentalMock.idRentalExists,
        userId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407c',
      }),
    ).rejects.toThrow('You are not allowed to update this rental');
  });

  it('should throw an error if start date is less than current date', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: rentalMock.idRentalExists,
        userId: rentalMock.mockRental.renterId,
        startAt: new Date(
          new Date().getTime() - 1000 * 60 * 60 * 24,
        ).toISOString(),
      }),
    ).rejects.toThrow('Start date must be greater than the current date');
  });

  it('should throw an error if start date is greater than end date', async () => {
    await expect(
      updateRentalService.execute({
        rentalId: rentalMock.idRentalExists,
        userId: rentalMock.mockRental.renterId,
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
        rentalId: rentalMock.idRentalExists,
        userId: rentalMock.mockRental.renterId,
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
        rentalId: rentalMock.idRentalExists,
        userId: rentalMock.mockRental.renterId,
        startAt: newStartAt,
        endAt: newEndAt,
      }),
    ).rejects.toThrow('Start date must be less than the end date');
  });

  it('should update a rental with status', async () => {
    const { rental } = await updateRentalService.execute({
      rentalId: rentalMock.idRentalExists,
      userId: rentalMock.mockRental.renterId,
      status: RentalStatus.FINISHED,
    });

    expect(rental.status).toBe(RentalStatus.FINISHED);
  });
});
