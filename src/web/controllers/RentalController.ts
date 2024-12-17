import type { FastifyReply, FastifyRequest } from 'fastify';
import { EquipmentPrismaRepository } from 'repository/prisma/EquipmentPrismaRepository';
import { RentalPrismaRepository } from 'repository/prisma/RentalPrismaRepository';
import { CreateRentalService } from 'services/rental/CreateRentalService';
import { DeleteRentalService } from 'services/rental/DeleteRentalService';
import { GetRentalService } from 'services/rental/GetRentalService';
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
    const rentalId = request.params as string;

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
    const rentalId = request.params as string;

    const userId = request.user.sub;

    const rentalRepository = new RentalPrismaRepository();
    const deleteRentalService = new DeleteRentalService(rentalRepository);

    await deleteRentalService.execute({
      rentalId,
      userId,
    });

    return reply.code(204).send();
  }
}
