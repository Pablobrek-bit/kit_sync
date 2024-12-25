import { RentalStatus } from '@prisma/client';
import { IndexRentalService } from 'services/rental/IndexRentalService';
import { RentalMock } from 'tests/mocks/RentalMock';

describe('Index Rental Service', () => {
  let indexRentalService: IndexRentalService;
  let rentalMock: RentalMock;

  beforeEach(() => {
    rentalMock = new RentalMock();
    indexRentalService = new IndexRentalService(
      rentalMock.rentalRepositoryMock,
    );
  });

  it('should return a list of rentals', async () => {
    const { rentals } = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by status', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      status: RentalStatus.PENDING,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by total', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      totalMin: 5,
      totalMax: 15,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by startAt', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      startAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by endAt', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      endAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by createdAt', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      createdAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by updatedAt', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      updatedAt: new Date().toISOString(),
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by equipmentId', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      equipmentId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407z',
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by page and size', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by renterId', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should return a list of rentals filtered by renterId and status', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdBelongsToRental,
      status: RentalStatus.PENDING,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([rentalMock.mockRental]);
  });

  it('should not return a list of rentals filtered by renterId by not belonging to the any rental', async () => {
    const response = await indexRentalService.execute({
      renterId: rentalMock.renterIdNotBelongsToRental,
      page: 1,
      size: 1,
    });

    expect(response.rentals).toEqual([]);
  });
});
