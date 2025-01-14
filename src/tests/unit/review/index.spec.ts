import { IndexReviewService } from 'services/review/IndexReviewService';
import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { ReviewMock } from 'tests/mocks/ReviewMock';

describe('Create Review Service', () => {
  let indexReviewService: IndexReviewService;
  let reviewMock: ReviewMock;
  let equipmentMock: EquipmentMock;
  const page = 1;
  const size = 5;

  beforeEach(() => {
    reviewMock = new ReviewMock();
    equipmentMock = new EquipmentMock();
    indexReviewService = new IndexReviewService(
      reviewMock.reviewRepositoryMock,
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should be able to list reviews by equipment', async () => {
    const { reviews } = await indexReviewService.execute({
      equipmentId: reviewMock.equipmentIdExists,
      page,
      size,
    });

    expect(reviews).toEqual([reviewMock.mockReview]);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledWith(reviewMock.equipmentIdExists);
    expect(reviewMock.reviewRepositoryMock.index).toHaveBeenCalledTimes(1);
  });

  it('should be able to list reviews by reviewer', async () => {
    const { reviews } = await indexReviewService.execute({
      reviewerId: reviewMock.reviewerIdExists,
      page,
      size,
    });

    expect(reviews).toEqual([reviewMock.mockReview]);
    expect(reviewMock.reviewRepositoryMock.index).toHaveBeenCalledTimes(1);
  });

  it('should not be able to list reviews by equipment not found', async () => {
    await expect(
      indexReviewService.execute({
        equipmentId: reviewMock.equipmentIdNotExists,
        page,
        size,
      }),
    ).rejects.toThrow('Equipment not found');
  });

  it('should be able to list reviews by equipment and reviewer', async () => {
    const { reviews } = await indexReviewService.execute({
      equipmentId: reviewMock.equipmentIdExists,
      reviewerId: reviewMock.reviewerIdExists,
      page,
      size,
    });

    expect(reviews).toEqual([reviewMock.mockReview]);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledWith(reviewMock.equipmentIdExists);
    expect(reviewMock.reviewRepositoryMock.index).toHaveBeenCalledTimes(1);
  });
});
