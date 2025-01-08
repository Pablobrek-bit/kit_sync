import type { FastifyReply, FastifyRequest } from 'fastify';
import { RentalPrismaRepository } from 'repository/prisma/RentalPrismaRepository';
import { ReviewPrismaRepository } from 'repository/prisma/ReviewPrismaRepository';
import { CreateReviewService } from 'services/review/CreateReviewService';
import { z } from 'zod';

export class ReviewController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const schema = z
      .object({
        rating: z
          .number({
            invalid_type_error: 'Rating must be a number',
            message: 'Rating is required',
          })
          .int({ message: 'Rating must be an integer' })
          .min(1, { message: 'Rating must be at least 1' })
          .max(5, { message: 'Rating must be at most 5' }),
        comment: z
          .string({ invalid_type_error: 'Comment must be a string' })
          .optional(),
      })
      .strict();

    const paramsSchema = z
      .object({
        rentalId: z
          .string({ message: 'Rental ID is required' })
          .uuid({ message: 'Rental ID must be a valid UUID' }),
      })
      .strict();

    const data = schema.parse(request.body);
    const { rentalId } = paramsSchema.parse(request.params);
    const userId = request.user.sub;

    const reviewRepository = new ReviewPrismaRepository();
    const rentalRepository = new RentalPrismaRepository();
    const createReviewService = new CreateReviewService(
      reviewRepository,
      rentalRepository,
    );

    const { review } = await createReviewService.execute({
      ...data,
      rentalId,
      userId,
    });

    reply.status(201).send({ review });
  }
}
