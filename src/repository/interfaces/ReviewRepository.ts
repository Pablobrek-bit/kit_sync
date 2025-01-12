import type { Prisma, Review } from '@prisma/client';

export interface ReviewRepository {
  create(data: Prisma.ReviewUncheckedCreateInput): Promise<Review>;

  index(data: {
    receptionId?: string;
    reviewerId?: string;
    equipmentId?: string;
    page: number;
    size: number;
  }): Promise<Review[]>;

  findById(reviewId: string): Promise<Review | null>;

  delete(reviewId: string): Promise<void>;
}
