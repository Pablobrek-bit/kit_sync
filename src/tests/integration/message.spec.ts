import { Role, type Equipment, type Rental, type User } from '@prisma/client';
import { app } from 'app';
import { hash } from 'bcryptjs';
import { prisma } from 'lib/prisma';
import request from 'supertest';

describe('Message API Integration Test', () => {
  let token: string;
  const userFactory = (
    overrides?: Partial<{
      name: string;
      email: string;
      password: string;
      role: Role;
    }>,
  ) => ({
    name: overrides?.name || 'User',
    email: overrides?.email || 'user@gmail.com',
    password: overrides?.password || '123456',
    role: overrides?.role || Role.USER,
  });

  const authenticateUser = async (user: ReturnType<typeof userFactory>) => {
    await prisma.user.create({
      data: {
        ...user,
        password: await hash(user.password, 8),
      },
    });

    const response = await request(app.server)
      .post('/auth')
      .send({ email: user.email, password: user.password });

    const token = response.body.token;
    const userCreated = response.body.user;

    return { token, user: userCreated, response };
  };

  const equipmentFactory = (
    overrides?: Partial<{
      name: string;
      description: string;
      category: string;
      dailyPrice: number;
      photos: string[];
    }>,
  ) => ({
    name: overrides?.name || 'Equipment Test',
    description: overrides?.description || 'Equipment Test Description',
    category: overrides?.category || 'Equipment Test Category',
    dailyPrice: overrides?.dailyPrice || 100,
    photos: overrides?.photos || ['photo1', 'photo2'],
  });

  const createEquipment = async (
    equipment: ReturnType<typeof equipmentFactory>,
  ) => {
    const response = await request(app.server)
      .post('/equipments')
      .set('Authorization', `Bearer ${token}`)
      .send(equipment);

    return response.body.equipment;
  };

  const rentalFactory = (
    overrides?: Partial<{
      equipmentId: string;
      ownerId: string;
      startAt: string;
      endAt: string;
    }>,
  ) => ({
    equipmentId: overrides?.equipmentId || equipment.id,
    ownerId: overrides?.ownerId || owner.id,
    startAt: overrides?.startAt || startAt,
    endAt: overrides?.endAt || endAt,
  });

  const createRental = async (rental: ReturnType<typeof rentalFactory>) => {
    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    return response;
  };

  const messageFactory = (
    overrides?: Partial<{
      senderId: string;
      receiverId: string;
      rentalId: string;
      text: string;
    }>,
  ) => ({
    senderId: overrides?.senderId || rental.ownerId,
    receiverId: overrides?.receiverId || rental.renterId,
    rentalId: overrides?.rentalId || rental.id,
    text: overrides?.text || 'Message Test',
  });

  const createMessage = async (message: ReturnType<typeof messageFactory>) => {
    const response = await request(app.server)
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send(message);

    return response;
  };

  const startAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
  const endAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 2);

  let equipment: Equipment;
  let owner: User;
  let rental: Rental;

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    token = (
      await authenticateUser(
        userFactory({ role: Role.ADMIN, email: 'admin@gmail.com' }),
      )
    ).token;

    const { user: ownerUser } = await authenticateUser(
      userFactory({ role: Role.USER }),
    );
    owner = ownerUser;

    equipment = await createEquipment(equipmentFactory({}));

    rental = (await createRental(rentalFactory())).body;
    await prisma.rental.update({
      where: { id: rental.id },
      data: { status: 'FINISHED' },
    });
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.rental.deleteMany(),
      prisma.equipment.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  // CREATE
  it('should be able to create a message', async () => {
    const response = await createMessage(messageFactory({}));

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toHaveProperty('id');
    expect(response.body.message.text).toBe('Message Test');
  });
});
