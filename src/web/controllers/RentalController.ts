import { RentalStatus } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { EquipmentPrismaRepository } from 'repository/prisma/EquipmentPrismaRepository';
import { RentalPrismaRepository } from 'repository/prisma/RentalPrismaRepository';
import { CreateRentalService } from 'services/rental/CreateRentalService';
import { DeleteRentalService } from 'services/rental/DeleteRentalService';
import { GetRentalService } from 'services/rental/GetRentalService';
import { IndexRentalService } from 'services/rental/IndexRentalService';
import { UpdateRentalService } from 'services/rental/UpdateRentalService';
import { z } from 'zod';

export class RentalController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      equipmentId: z.string({ required_error: 'Equipment ID is required' }),
      startAt: z.string({ required_error: 'Start date is required' }),
      endAt: z.string({ required_error: 'End date is required' }),
    });

    const renterId = request.user.sub;

    const { equipmentId, startAt, endAt } = schema.parse(request.body);

    const rentalRepository = new RentalPrismaRepository();
    const equipmentRepository = new EquipmentPrismaRepository();

    const rentalService = new CreateRentalService(
      rentalRepository,
      equipmentRepository,
    );

    const { rental } = await rentalService.execute({
      equipmentId,
      startAt,
      endAt,
      renterId,
    });

    return reply.code(201).send(rental);
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const schemaParams = z.object({
      id: z.string({ required_error: 'Rental ID is required' }),
    });

    const { id: rentalId } = schemaParams.parse(request.params);

    const userId = request.user.sub;

    const rentalRepository = new RentalPrismaRepository();
    const getRentalService = new GetRentalService(rentalRepository);

    const { rental } = await getRentalService.execute({
      rentalId,
      userId,
    });

    return reply.send(rental);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      status: z.nativeEnum(RentalStatus, {
        invalid_type_error: 'Status must be a valid',
        required_error: 'Status is required',
      }),
    });

    const schemaParams = z.object({
      id: z.string({ required_error: 'Rental ID is required' }),
    });

    const { id: rentalId } = schemaParams.parse(request.params);
    const { status } = schema.parse(request.body);
    const userId = request.user.sub;

    const rentalRepository = new RentalPrismaRepository();
    const deleteRentalService = new DeleteRentalService(rentalRepository);

    await deleteRentalService.execute({
      rentalId,
      userId,
      status,
    });

    return reply.code(204).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      startAt: z
        .string({ invalid_type_error: 'Start date must be a string' })
        .optional(),
      endAt: z
        .string({ invalid_type_error: 'End date must be a string' })
        .optional(),
      status: z
        .nativeEnum(RentalStatus, {
          invalid_type_error: 'Status must be a valid',
        })
        .optional(),
    });

    const schemaParams = z.object({
      id: z.string({ required_error: 'Rental ID is required' }),
    });

    const { id: rentalId } = schemaParams.parse(request.params);
    const userId = request.user.sub;

    const { startAt, endAt, status } = schema.parse(request.body);

    const rentalRepository = new RentalPrismaRepository();
    const updateRentalService = new UpdateRentalService(rentalRepository);

    const rental = await updateRentalService.execute({
      rentalId,
      userId,
      startAt,
      endAt,
      status,
    });

    return reply.send(rental);
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      status: z
        .nativeEnum(RentalStatus, {
          invalid_type_error: 'Status need to be a valid status',
        })
        .optional(),
      totalMin: z.coerce
        .number({ invalid_type_error: 'Total Min must to be a number' })
        .positive({ message: 'Total Min must to be positive' })
        .optional(),
      totalMax: z.coerce
        .number({ invalid_type_error: 'Total Max must to be a number' })
        .positive({ message: 'Total Max must to be positive' })
        .optional(),
      startAt: z
        .string({ invalid_type_error: 'StartAt must be a string' })
        .optional(),
      endAt: z
        .string({ invalid_type_error: 'EndAt must be a string' })
        .optional(),
      createdAt: z
        .string({ invalid_type_error: 'CreatedAt must be a string' })
        .optional(),
      updatedAt: z
        .string({ invalid_type_error: 'UpdatedAt must be a string' })
        .optional(),
      equipmentId: z
        .string({ invalid_type_error: 'EquipmentId must be a string' })
        .optional(),
      page: z.coerce
        .number({ invalid_type_error: 'Page must to be type number' })
        .positive({ message: 'Page must to be positive' })
        .default(1),
      size: z.coerce
        .number({ invalid_type_error: 'Size must to be type number' })
        .positive({ message: 'Size must to be positive' })
        .default(5),
    });

    const renterId = request.user.sub;
    const filters = schema.parse(request.query);

    const rentalRepository = new RentalPrismaRepository();
    const indexRentalService = new IndexRentalService(rentalRepository);

    const { rentals } = await indexRentalService.execute({
      renterId,
      ...filters,
    });

    return reply.send(rentals);
  }
}
