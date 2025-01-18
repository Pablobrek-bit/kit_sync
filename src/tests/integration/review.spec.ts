import { prisma } from 'lib/prisma';
import { app } from '../../app';
import request from 'supertest';
import { Role, type Equipment, type Rental, type User } from '@prisma/client';
import { hash } from 'bcryptjs';

describe('Review API Integration Tests', () => {
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

  const reviewFactory = (
    overrides?: Partial<{
      rating: number;
      comment: string;
    }>,
  ) => ({
    rating: overrides?.rating || 5,
    comment: overrides?.comment || 'Good',
  });

  const createReview = async (review: ReturnType<typeof reviewFactory>) => {
    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    return response;
  };

  let token: string;
  let tokerOwner: string;
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

    const { token: ownerToken, user: ownerUser } = await authenticateUser(
      userFactory({ role: Role.USER }),
    );
    tokerOwner = ownerToken;
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
  it('should be able to create a new review', async () => {
    const response = await createReview(reviewFactory());

    expect(response.status).toBe(201);
    expect(response.body.review).toHaveProperty('id');
  });

  it('should not be able to create a new review with invalid rating', async () => {
    const response = await createReview(reviewFactory({ rating: 6 }));

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new review with invalid comment', async () => {
    const review = {
      rating: 5,
      comment: 12,
    };

    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new review with invalid rentalId', async () => {
    const response = await request(app.server)
      .post(`/reviews/100`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(reviewFactory());

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to create a new review with invalid token', async () => {
    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer 123`)
      .send(reviewFactory());

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is invalid');
  });

  it('should not be able to create a new review without token', async () => {
    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .send(reviewFactory());

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  // INDEX BY EQUIPMENT
  it('should be able to list reviews by equipment', async () => {
    await createReview(reviewFactory());

    const response = await request(app.server)
      .get(`/reviews/index/${equipment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews).toHaveLength(1);
  });

  it('should not be able to list reviews by equipment with invalid equipmentId', async () => {
    const response = await request(app.server)
      .get(`/reviews/index/100`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to list reviews by equipment with equipment not found', async () => {
    const response = await request(app.server)
      .get(`/reviews/index/4a95d2c8-7e33-4215-85f1-46bd6a3a407e`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Equipment not found');
  });

  it('should not be able to list reviews by equipment without token', async () => {
    const response = await request(app.server).get(
      `/reviews/index/${equipment.id}`,
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to list reviews by equipment with invalid token', async () => {
    const response = await request(app.server)
      .get(`/reviews/index/${equipment.id}`)
      .set('Authorization', `Bearer 123`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is invalid');
  });

  // INDEX BY USER
  it('should be able to list reviews by owner user', async () => {
    await createReview(reviewFactory());

    const response = await request(app.server)
      .get(`/reviews/me`)
      .set('Authorization', `Bearer ${tokerOwner}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews).toHaveLength(1);
  });

  it('should be able to list reviews by renter user', async () => {
    await createReview(reviewFactory());

    const response = await request(app.server)
      .get(`/reviews/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews).toHaveLength(1);
  });

  it('should not be able to list reviews by user without token', async () => {
    const response = await request(app.server).get(`/reviews/me`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to list reviews by user with invalid token', async () => {
    const response = await request(app.server)
      .get(`/reviews/me`)
      .set('Authorization', `Bearer 123`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is invalid');
  });

  // DELETE
  it('should be able to delete a review with role admin', async () => {
    const review = (await createReview(reviewFactory())).body.review;

    const response = await request(app.server)
      .delete(`/reviews/${review.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should not be able to delete a review with role user', async () => {
    const review = (await createReview(reviewFactory())).body.review;

    const response = await request(app.server)
      .delete(`/reviews/${review.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should not be able to delete a review with invalid reviewId', async () => {
    const response = await request(app.server)
      .delete(`/reviews/100`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to delete a review with review not found', async () => {
    const response = await request(app.server)
      .delete(`/reviews/4a95d2c8-7e33-4215-85f1-46bd6a3a407e`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Review not found');
  });

  it('should not be able to delete a review without token', async () => {
    const response = await request(app.server).delete(`/reviews/100`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to delete a review with invalid token', async () => {
    const response = await request(app.server)
      .delete(`/reviews/100`)
      .set('Authorization', `Bearer 123`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is invalid');
  });

  it('should not be able to delete a review with review already deleted', async () => {
    const review = (await createReview(reviewFactory())).body.review;

    await request(app.server)
      .delete(`/reviews/${review.id}`)
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .delete(`/reviews/${review.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Review already deleted');

    const reviewDeleted = await prisma.review.findUnique({
      where: { id: review.id },
    });

    expect(reviewDeleted?.deleted).toBe(true);
  });
});
