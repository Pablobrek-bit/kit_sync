import type { FastifyReply, FastifyRequest } from 'fastify';
import { EquipmentPrismaRepository } from 'repository/prisma/EquipmentPrismaRepository';
import { CreateEquipamentService } from 'services/equipament/CreateEquipamentService';
import { DeleteEquipmentService } from 'services/equipament/DeleteEquipmentService';
import { GetEquipamentService } from 'services/equipament/GetEquipamentService';
import { z } from 'zod';

export class EquipamentController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      description: z.string({ required_error: 'Description is required' }),
      category: z.string({ required_error: 'Category is required' }),
      dailyPrice: z
        .number({ required_error: 'Daily price is required' })
        .positive({ message: 'Daily price must be positive' }),
      available: z.boolean().optional(),
      photos: z.array(z.string()).optional(),
    });

    const propertyId = request.user.sub;

    const equipmentRepository = new EquipmentPrismaRepository();
    const equipmenteCreateService = new CreateEquipamentService(
      equipmentRepository,
    );

    const data = schema.parse(request.body);

    const { equipament } = await equipmenteCreateService.execute({
      ...data,
      propertyId,
    });

    return reply.status(201).send({ equipament });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const schemaParams = z.string({
      required_error: 'EquipamentId is required',
    });

    const equipamentId = schemaParams.parse(request.params);

    const equipmentRepository = new EquipmentPrismaRepository();
    const equipmentGetService = new GetEquipamentService(equipmentRepository);

    const { equipament } = await equipmentGetService.execute({ equipamentId });

    return reply.send({ equipament });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const schemaParams = z.string({
      required_error: 'EquipamentId is required',
    });

    const equipamentId = schemaParams.parse(request.params);

    const userId = request.user.sub;

    const equipmentRepository = new EquipmentPrismaRepository();
    const deleteEquipmentService = new DeleteEquipmentService(
      equipmentRepository,
    );

    await deleteEquipmentService.execute({ id: equipamentId, userId });

    return reply.status(204).send();
  }
}
