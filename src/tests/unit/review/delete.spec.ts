import { DeleteReviewService } from 'services/review/DeleteReviewService';
import { ReviewMock } from 'tests/mocks/ReviewMock';

describe('Delete Review Service', () => {
  let deleteReviewService: DeleteReviewService;
  let reviewMock: ReviewMock;

  beforeEach(() => {
    reviewMock = new ReviewMock();
    deleteReviewService = new DeleteReviewService(
      reviewMock.reviewRepositoryMock,
    );
  });

  it('should be able to delete a review', async () => {
    await deleteReviewService.execute({
      reviewId: reviewMock.idExists,
    });

    expect(reviewMock.reviewRepositoryMock.findById).toHaveBeenCalledWith(
      reviewMock.idExists,
    );
    expect(reviewMock.reviewRepositoryMock.update).toHaveBeenCalledWith({
      id: reviewMock.idExists,
      deleted: true,
      deleteAt: expect.any(Date),
    });
    expect(reviewMock.mockReview.deleted).toBe(true);
  });

  it('should not be able to delete a review not found', async () => {
    await expect(
      deleteReviewService.execute({
        reviewId: reviewMock.idNotExists,
      }),
    ).rejects.toThrow('Review not found');
  });

  it('should not be able to delete a review already deleted', async () => {
    reviewMock.mockReview.deleted = true;

    await expect(
      deleteReviewService.execute({
        reviewId: reviewMock.idExists,
      }),
    ).rejects.toThrow('Review already deleted');
  });

  it('should not be able to delete a review with an invalid id', async () => {
    await expect(
      deleteReviewService.execute({
        reviewId: 'invalid_id',
      }),
    ).rejects.toThrow('Review not found');
  });
});
