import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface DeleteReviewServiceRequest {
  reviewId: string;
}

export class DeleteReviewService {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute({ reviewId }: DeleteReviewServiceRequest) {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new InvalidArgumentError('Review not found');
    }

    await this.reviewRepository.delete(reviewId);
  }
}
