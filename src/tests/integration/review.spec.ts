import { prisma } from 'lib/prisma';
import { app } from '../../app';
import request from 'supertest';
import { Role, type Equipment, type Rental, type User } from '@prisma/client';

describe('User API Integration Tests', () => {
  let token: string;
  let tokerOwner: string;
  const startAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
  const endAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 2);

  let user: User;
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
    user = await prisma.user.create({
      data: {
        name: 'Pablo',
        email: 'pabloTest@gmail.com',
        password:
          '$2a$08$G/99UQeyOAOix2dpDmNXjuCj2g5qhF5Iwa5DvC6g2xichVTAOE02e',
        role: Role.ADMIN,
      },
    });

    owner = await prisma.user.create({
      data: {
        name: 'Owner',
        email: 'owner@gmail.com',
        password:
          '$2a$08$G/99UQeyOAOix2dpDmNXjuCj2g5qhF5Iwa5DvC6g2xichVTAOE02e',
        role: Role.USER,
      },
    });

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: user.email, password: '123456' });

    token = loginResponse.body.token;

    const loginResponseOwner = await request(app.server)
      .post('/auth')
      .send({ email: owner.email, password: '123456' });

    tokerOwner = loginResponseOwner.body.token;

    equipment = await prisma.equipment.create({
      data: {
        name: 'Bike',
        description: 'Bike',
        dailyPrice: 10,
        propertyId: user.id,
        category: 'vehicle',
      },
    });

    rental = await prisma.rental.create({
      data: {
        status: 'FINISHED',
        startAt,
        endAt,
        equipmentId: equipment.id,
        renterId: user.id,
        ownerId: owner.id,
        total: 20,
      },
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
    const review = {
      rating: 5,
      comment: 'Good',
    };

    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    expect(response.status).toBe(201);
    expect(response.body.review).toHaveProperty('id');
  });

  it('should not be able to create a new review with invalid rating', async () => {
    const review = {
      rating: 6,
      comment: 'Good',
    };

    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

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
    const review = {
      rating: 5,
      comment: 'Good',
    };

    const response = await request(app.server)
      .post(`/reviews/100`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to create a new review with invalid token', async () => {
    const review = {
      rating: 5,
      comment: 'Good',
    };

    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer 123`)
      .send(review);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is invalid');
  });

  it('should not be able to create a new review without token', async () => {
    const review = {
      rating: 5,
      comment: 'Good',
    };

    const response = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .send(review);

    console.log('response.body', response.body);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  // INDEX BY EQUIPMENT
  it('should be able to list reviews by equipment', async () => {
    const review = {
      rating: 5,
      comment: 'Good',
    };

    await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

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
    const review = {
      rating: 5,
      comment: 'Good',
    };

    await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    const response = await request(app.server)
      .get(`/reviews/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.reviews).toHaveLength(1);
  });

  it('should be able to list reviews by renter user', async () => {
    const review = {
      rating: 5,
      comment: 'Good',
    };

    await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

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
    const review = {
      rating: 5,
      comment: 'Good',
    };

    const responseCreate = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    const reviewId = responseCreate.body.review.id;

    const response = await request(app.server)
      .delete(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should not be able to delete a review with role user', async () => {
    const review = {
      rating: 5,
      comment: 'Good',
    };

    const responseCreate = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    const reviewId = responseCreate.body.review.id;

    const response = await request(app.server)
      .delete(`/reviews/${reviewId}`)
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
    const review = {
      rating: 5,
      comment: 'Good',
    };

    const responseCreate = await request(app.server)
      .post(`/reviews/${rental.id}`)
      .set('Authorization', `Bearer ${tokerOwner}`)
      .send(review);

    const reviewId = responseCreate.body.review.id;

    await request(app.server)
      .delete(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .delete(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Review already deleted');

    const reviewDeleted = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    expect(reviewDeleted?.deleted).toBe(true);
  });
});
