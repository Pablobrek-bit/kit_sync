import { RentalStatus } from '@prisma/client';
import { DeleteRentalService } from 'services/rental/DeleteRentalService';
import { RentalMock } from 'tests/mocks/RentalMock';

describe('Delete Rental Service', () => {
  let deleteRentalService: DeleteRentalService;
  let rentalMock: RentalMock;

  beforeEach(() => {
    rentalMock = new RentalMock();
    deleteRentalService = new DeleteRentalService(
      rentalMock.rentalRepositoryMock,
    );
  });

  it('should be able to delete a rental', async () => {
    await deleteRentalService.execute({
      rentalId: rentalMock.idRentalExists,
      userId: rentalMock.mockRental.renterId,
      status: RentalStatus.FINISHED,
    });

    expect(rentalMock.rentalRepositoryMock.findById).toHaveBeenCalledTimes(1);
    expect(rentalMock.rentalRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(rentalMock.rentalRepositoryMock.update).toHaveBeenCalledWith({
      id: rentalMock.idRentalExists,
      status: RentalStatus.FINISHED,
      deleteAt: expect.any(Date),
    });
  });

  it('should not be able to delete a rental that does not exist', async () => {
    await expect(
      deleteRentalService.execute({
        rentalId: '4a95d2c8-7e33-4215-85f1-46bd6a3a402z',
        userId: rentalMock.mockRental.renterId,
        status: RentalStatus.FINISHED,
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should not be able to delete a rental that does not belong to the user', async () => {
    await expect(
      deleteRentalService.execute({
        rentalId: rentalMock.idRentalExists,
        userId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407z',
        status: RentalStatus.FINISHED,
      }),
    ).rejects.toThrow('You are not allowed to delete this rental');
  });
});
