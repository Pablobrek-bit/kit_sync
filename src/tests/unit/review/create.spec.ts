import { CreateReviewService } from 'services/review/CreateReviewService';
import { RentalMock } from 'tests/mocks/RentalMock';
import { ReviewMock } from 'tests/mocks/ReviewMock';

describe('Create Review Service', () => {
  let createReviewService: CreateReviewService;
  let reviewMock: ReviewMock;
  let rentalMock: RentalMock;

  beforeEach(() => {
    reviewMock = new ReviewMock();
    rentalMock = new RentalMock();
    createReviewService = new CreateReviewService(
      reviewMock.reviewRepositoryMock,
      rentalMock.rentalRepositoryMock,
    );
  });

  it('should be able to create a new review', async () => {
    rentalMock.mockRental.status = 'FINISHED';

    const { review } = await createReviewService.execute({
      rating: 5,
      ownerId: rentalMock.idOwnerExists,
      rentalId: rentalMock.idRentalExists,
      comment: 'Good equipment',
    });

    expect(review).toEqual(reviewMock.mockReview);
    expect(rentalMock.rentalRepositoryMock.findById).toHaveBeenCalledWith(
      rentalMock.idRentalExists,
    );
    expect(reviewMock.reviewRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(rentalMock.rentalRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a new review with a rental not found', async () => {
    await expect(
      createReviewService.execute({
        rating: 5,
        ownerId: rentalMock.idOwnerExists,
        rentalId: rentalMock.idRentalNotExists,
        comment: 'Good equipment',
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should not be able to create a new review with a rental not finished', async () => {
    rentalMock.mockRental.status = 'PENDING';

    await expect(
      createReviewService.execute({
        rating: 5,
        ownerId: rentalMock.idOwnerExists,
        rentalId: rentalMock.idRentalExists,
        comment: 'Good equipment',
      }),
    ).rejects.toThrow('Rental must be FINISHED');
  });

  it('should not be able to create a new review with a user not the owner of the rental', async () => {
    rentalMock.mockRental.status = 'FINISHED';

    await expect(
      createReviewService.execute({
        rating: 5,
        ownerId: rentalMock.renterIdNotBelongsToRental,
        rentalId: rentalMock.idRentalExists,
        comment: 'Good equipment',
      }),
    ).rejects.toThrow('User is not the owner of the rental');
  });
});
