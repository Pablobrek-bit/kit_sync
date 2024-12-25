import { GetRentalService } from 'services/rental/GetRentalService';
import { RentalMock } from 'tests/mocks/RentalMock';

describe('Get Rental Service', () => {
  let getRentalService: GetRentalService;
  let rentalMock: RentalMock;

  beforeEach(() => {
    rentalMock = new RentalMock();
    getRentalService = new GetRentalService(rentalMock.rentalRepositoryMock);
  });

  it('should return a rental', async () => {
    const { rental } = await getRentalService.execute({
      rentalId: rentalMock.idRentalExists,
      userId: rentalMock.renterIdBelongsToRental,
    });

    expect(rental).toEqual(rentalMock.mockRental);
    expect(rentalMock.rentalRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if rental does not exist', async () => {
    await expect(
      getRentalService.execute({
        rentalId: rentalMock.idRentalNotExists,
        userId: rentalMock.renterIdBelongsToRental,
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should throw an error if user is not allowed to access the rental', async () => {
    await expect(
      getRentalService.execute({
        rentalId: rentalMock.idRentalExists,
        userId: rentalMock.renterIdNotBelongsToRental,
      }),
    ).rejects.toThrow('Unauthorized');
  });
});
