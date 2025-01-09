import type { Review } from '@prisma/client';
import type { EquipamentRepository } from 'repository/interfaces/EquipamentRepository';
import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface IndexReviewServiceRequest {
  equipmentId: string;
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
  }: IndexReviewServiceRequest): Promise<IndexReviewServiceResponse> {
    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (!equipment) {
      throw new InvalidArgumentError('Equipment not found');
    }

    const reviews = await this.reviewRepository.index({
      equipmentId,
      page,
      size,
    });

    return { reviews };
  }
}
