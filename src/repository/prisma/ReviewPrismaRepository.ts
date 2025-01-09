import type { Prisma } from '@prisma/client';
import { prisma } from 'lib/prisma';
import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';

export class ReviewPrismaRepository implements ReviewRepository {
  async create(data: Prisma.ReviewUncheckedCreateInput) {
    const review = await prisma.review.create({ data });

    return review;
  }

  async index(data: { equipmentId: string; page: number; size: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (data.equipmentId) {
      where.equipmentId = data.equipmentId;
    }

    const reviews = await prisma.review.findMany({
      where,
      skip: (data.page - 1) * data.size,
      take: data.size,
    });

    return reviews;
  }
}
