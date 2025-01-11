import type { Review } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface IndexReviewServiceRequest {
  receptionId?: string;
  reviewerId?: string;
  equipmentId?: string;
  page: number;
  size: number;
}

interface IndexReviewServiceResponse {
  reviews: Review[];
}

export class IndexReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private equipmentRepository: EquipamentRepository,
  ) {}

  async execute({
    equipmentId,
    page,
    size,
    receptionId,
    reviewerId,
  }: IndexReviewServiceRequest): Promise<IndexReviewServiceResponse> {
    if (equipmentId) {
      const equipment = await this.equipmentRepository.findById(equipmentId);

      if (!equipment) {
        throw new InvalidArgumentError('Equipment not found');
      }
    }

    const reviews = await this.reviewRepository.index({
      equipmentId,
      receptionId,
      reviewerId,
      page,
      size,
    });

    return { reviews };
  }
}
