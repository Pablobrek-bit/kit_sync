import type { Review } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface CreateReviewServiceRequest {
  rating: number;
  comment?: string;
  rentalId: string;
  userId: string;
}

interface CreateReviewServiceResponse {
  review: Review;
}

export class CreateReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private rentalRepository: RentalRepository,
  ) {}

  async execute({
    rating,
    rentalId,
    userId,
    comment,
  }: CreateReviewServiceRequest): Promise<CreateReviewServiceResponse> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new InvalidArgumentError('Rental not found');
    }

    const review = await this.reviewRepository.create({
      rating,
      comment,
      rentalId,
      reviewerId: userId,
      equipmentId: rental.equipmentId,
    });

    return { review };
  }
}
