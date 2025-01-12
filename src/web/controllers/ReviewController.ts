import type { FastifyReply, FastifyRequest } from 'fastify';
import { EquipmentPrismaRepository } from 'repository/prisma/EquipmentPrismaRepository';
import { RentalPrismaRepository } from 'repository/prisma/RentalPrismaRepository';
import { ReviewPrismaRepository } from 'repository/prisma/ReviewPrismaRepository';
import { CreateReviewService } from 'services/review/CreateReviewService';
import { DeleteReviewService } from 'services/review/DeleteReviewService';
import { IndexReviewService } from 'services/review/IndexReviewService';
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
    const ownerId = request.user.sub;

    const reviewRepository = new ReviewPrismaRepository();
    const rentalRepository = new RentalPrismaRepository();
    const createReviewService = new CreateReviewService(
      reviewRepository,
      rentalRepository,
    );

    const { review } = await createReviewService.execute({
      ...data,
      rentalId,
      ownerId,
    });

    reply.status(201).send({ review });
  }

  async indexByEquipment(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z
      .object({
        equipmentId: z
          .string({ message: 'Equipment ID is required' })
          .uuid({ message: 'Equipment ID must be a valid UUID' }),
      })
      .strict();

    const querySchema = z.object({
      page: z.coerce
        .number({ invalid_type_error: 'Page must to be a type number' })
        .positive({ message: 'Page must to be positive' })
        .default(1),
      size: z.coerce
        .number({
          invalid_type_error: 'Size must to be a type number',
        })
        .positive({ message: 'Size must to be positive' })
        .default(5),
    });

    const { equipmentId } = paramsSchema.parse(request.params);
    const data = querySchema.parse(request.query);

    const reviewRepository = new ReviewPrismaRepository();
    const equipmentRepository = new EquipmentPrismaRepository();
    const indexReviewService = new IndexReviewService(
      reviewRepository,
      equipmentRepository,
    );

    const { reviews } = await indexReviewService.execute({
      equipmentId,
      ...data,
    });

    reply.send({ reviews });
  }

  async indexByUser(request: FastifyRequest, reply: FastifyReply) {
    const querySchema = z.object({
      page: z.coerce
        .number({ invalid_type_error: 'Page must to be a type number' })
        .positive({ message: 'Page must to be positive' })
        .default(1),
      size: z.coerce
        .number({
          invalid_type_error: 'Size must to be a type number',
        })
        .positive({ message: 'Size must to be positive' })
        .default(5),
    });

    const data = querySchema.parse(request.query);
    const userId = request.user.sub;

    const reviewRepository = new ReviewPrismaRepository();
    const equipmentRepository = new EquipmentPrismaRepository();
    const indexReviewService = new IndexReviewService(
      reviewRepository,
      equipmentRepository,
    );

    const { reviews } = await indexReviewService.execute({
      receptionId: userId,
      reviewerId: userId,
      ...data,
    });

    reply.send({ reviews });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z
      .object({
        reviewId: z
          .string({ message: 'Review ID is required' })
          .uuid({ message: 'Review ID must be a valid UUID' }),
      })
      .strict();

    const { reviewId } = paramsSchema.parse(request.params);

    const reviewRepository = new ReviewPrismaRepository();
    const deleteReviewService = new DeleteReviewService(reviewRepository);

    await deleteReviewService.execute({ reviewId });

    reply.status(204).send();
  }
}
