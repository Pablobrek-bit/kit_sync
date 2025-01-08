import type { Prisma } from '@prisma/client';
import { prisma } from 'lib/prisma';
import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';

export class ReviewPrismaRepository implements ReviewRepository {
  async create(data: Prisma.ReviewUncheckedCreateInput) {
    const review = await prisma.review.create({ data });

    return review;
  }
}
