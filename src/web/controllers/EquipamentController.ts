import type { FastifyReply, FastifyRequest } from 'fastify';
import { EquipmentPrismaRepository } from 'repository/prisma/EquipmentPrismaRepository';
import { CreateEquipamentService } from 'services/equipament/CreateEquipamentService';
import { DeleteEquipmentService } from 'services/equipament/DeleteEquipmentService';
import { DeletePhotoEquipmentService } from 'services/equipament/DeletePhotoEquipmentService';
import { GetEquipamentService } from 'services/equipament/GetEquipamentService';
import { IndexEquipmentService } from 'services/equipament/IndexEquipmentService';
import { UpdateEquipmentService } from 'services/equipament/UpdateEquipmentService';
import { UploadPhotoEquipmentService } from 'services/equipament/UploadPhotoEquipmentService';
import { z } from 'zod';

export class EquipamentController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const schema = z
      .object({
        name: z.string({ required_error: 'Name is required' }),
        description: z.string({ required_error: 'Description is required' }),
        category: z.string({ required_error: 'Category is required' }),
        dailyPrice: z
          .number({ required_error: 'Daily price is required' })
          .positive({ message: 'Daily price must be positive' }),
        available: z.boolean().optional(),
        photos: z.array(z.string()).optional(),
      })
      .strict();

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
    const schemaParams = z.object({
      equipamentId: z.string({
        required_error: 'EquipamentId is required',
        invalid_type_error: 'EquipamentId must to be a string',
      }),
    });

    const { equipamentId } = schemaParams.parse(request.params);

    const equipmentRepository = new EquipmentPrismaRepository();
    const equipmentGetService = new GetEquipamentService(equipmentRepository);

    const { equipament } = await equipmentGetService.execute({ equipamentId });

    return reply.send({ equipament });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const schemaParams = z.object({
      equipamentId: z.string({
        required_error: 'EquipamentId is required',
        invalid_type_error: 'EquipamentId must to be a string',
      }),
    });

    const { equipamentId } = schemaParams.parse(request.params);

    const userId = request.user.sub;

    const equipmentRepository = new EquipmentPrismaRepository();
    const deleteEquipmentService = new DeleteEquipmentService(
      equipmentRepository,
    );

    await deleteEquipmentService.execute({ id: equipamentId, userId });

    return reply.status(204).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const schemaParams = z.object({
      equipamentId: z.string({
        required_error: 'EquipamentId is required',
        invalid_type_error: 'EquipamentId must to be a string',
      }),
    });

    const schema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      dailyPrice: z
        .number()
        .positive({ message: 'Daily price must to be positive' })
        .optional(),
      available: z.boolean().optional(),
      photos: z.array(z.string()).optional(),
    });

    const { equipamentId } = schemaParams.parse(request.params);
    const data = schema.parse(request.body);

    const userId = request.user.sub;

    const equipmentRepository = new EquipmentPrismaRepository();
    const updateEquipmentService = new UpdateEquipmentService(
      equipmentRepository,
    );

    const { equipment } = await updateEquipmentService.execute({
      id: equipamentId,
      userId,
      ...data,
    });

    return reply.code(200).send({ equipment });
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      name: z.string().optional(),
      category: z.string().optional(),
      dailyPrice: z.coerce
        .number({ invalid_type_error: 'Daily Price must to be a type number' })
        .positive({ message: 'Daily Price must to be positive' })
        .optional(),
      available: z.coerce
        .boolean({ invalid_type_error: 'Available must to be a type boolean' })
        .optional(),
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

    const data = schema.parse(request.query);

    const equipmentRepository = new EquipmentPrismaRepository();
    const indexEquipmentService = new IndexEquipmentService(
      equipmentRepository,
    );

    const { equipments } = await indexEquipmentService.execute(data);

    return reply.send({ equipments });
  }

  async uploadPhoto(request: FastifyRequest, reply: FastifyReply) {
    const schemaParams = z.object({
      equipmentId: z
        .string({
          required_error: 'EquipmentId is required',
          invalid_type_error: 'EquipmentId must to be a string',
        })
        .uuid({ message: 'EquipmentId must to be a valid UUID' }),
    });

    const schema = z
      .object({
        photos: z.array(z.string()).optional(),
      })
      .strict();

    const userId = request.user.sub;
    const { equipmentId } = schemaParams.parse(request.params);
    const { photos } = schema.parse(request.body);

    const equipmentRepository = new EquipmentPrismaRepository();
    const uploadPhotoEquipmentService = new UploadPhotoEquipmentService(
      equipmentRepository,
    );

    await uploadPhotoEquipmentService.execute({
      equipmentId,
      photos,
      userId,
    });

    return reply.code(204).send();
  }

  async deletePhoto(request: FastifyRequest, reply: FastifyReply) {
    const schemaParams = z.object({
      equipmentId: z
        .string({
          required_error: 'EquipmentId is required',
          invalid_type_error: 'EquipmentId must to be a string',
        })
        .uuid({ message: 'EquipmentId must to be a valid UUID' }),
      photoId: z.string({
        required_error: 'PhotoId is required',
        invalid_type_error: 'PhotoId must to be a string',
      }),
    });

    const userId = request.user.sub;
    const { equipmentId, photoId } = schemaParams.parse(request.params);

    const equipmentRepository = new EquipmentPrismaRepository();
    const deletePhotoEquipmentService = new DeletePhotoEquipmentService(
      equipmentRepository,
    );

    await deletePhotoEquipmentService.execute({
      equipmentId,
      photoId,
      userId,
    });

    return reply.code(204).send();
  }
}
