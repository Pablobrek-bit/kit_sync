import { RentalStatus, type Review } from '@prisma/client';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface CreateReviewServiceRequest {
  rating: number;
  comment?: string;
  rentalId: string;
  ownerId: string;
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
    ownerId,
    comment,
  }: CreateReviewServiceRequest): Promise<CreateReviewServiceResponse> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new InvalidArgumentError('Rental not found');
    }

    if (rental.ownerId !== ownerId) {
      throw new InvalidArgumentError('User is not the owner of the rental');
    }

    if (rental.status !== RentalStatus.FINISHED) {
      throw new InvalidArgumentError('Rental must be FINISHED');
    }

    const review = await this.reviewRepository.create({
      rating,
      comment,
      rentalId,
      reviewerId: ownerId,
      equipmentId: rental.equipmentId,
    });

    return { review };
  }
}
