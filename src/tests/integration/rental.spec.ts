import { app } from 'app';
import request from 'supertest';
import { prisma } from 'lib/prisma';
import type { Equipment } from '@prisma/client';

describe('Rental API Integration Tests', () => {
  let token: string;
  let equipmentCreated: Equipment;
  const user = {
    name: 'Pablo',
    email: 'pabloTest@gmail.com',
    password: '123456',
  };

  const equipment = {
    name: 'Equipment Test',
    description: 'Equipment Test Description',
    category: 'Equipment Test Category',
    dailyPrice: 100,
    photos: ['photo1', 'photo2'],
  };

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await request(app.server).post('/users').send(user);

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: user.email, password: user.password });

    token = loginResponse.body.token;

    const responseEquipment = await request(app.server)
      .post('/equipments')
      .set('Authorization', `Bearer ${token}`)
      .send(equipment);

    equipmentCreated = responseEquipment.body.equipament;
  });

  afterEach(async () => {
    await prisma.rental.deleteMany();
    await prisma.user.deleteMany();
    await prisma.equipment.deleteMany();
  });

  // CREATE
  it('should be create a new rental', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.equipmentId).toBe(equipmentCreated.id);
  });

  it('should not be able to create a rental with invalid equipment', async () => {
    const rental = {
      equipmentId: 'invalid-id',
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Equipment not found');
  });

  it('should not be able to create a rental with invalid date range', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-02',
      endAt: '2022-01-01',
    };

    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid date range');
  });

  it('should not be able to create a rental with equipment not available', async () => {
    await prisma.equipment.update({
      where: { id: equipmentCreated.id },
      data: { available: false },
    });

    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Equipment not available');
  });

  it('should not be able to create a rental without authentication', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const response = await request(app.server).post('/rentals').send(rental);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to create a rental without equipmentId', async () => {
    const rental = {
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to create a rental without startAt', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      endAt: '2022-01-02',
    };

    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to create a rental without endAt', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-01',
    };

    const response = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  // GET
  it('should be able to get a rental', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const responseCreate = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    const response = await request(app.server)
      .get(`/rentals/${responseCreate.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.equipmentId).toBe(equipmentCreated.id);
  });

  it('should not be able to get a rental with invalid id', async () => {
    const response = await request(app.server)
      .get('/rentals/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to get a rental without authentication', async () => {
    const response = await request(app.server).get('/rentals/1');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to get a rental with invalid user', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const responseCreate = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    const response = await request(app.server)
      .get(`/rentals/${responseCreate.body.id}`)
      .set('Authorization', `Bearer invalid-token`);

    expect(response.status).toBe(500);
  });

  it('should not be able to get a rental with unauthorized user', async () => {
    const rental = {
      equipmentId: equipmentCreated.id,
      startAt: '2022-01-01',
      endAt: '2022-01-02',
    };

    const responseCreate = await request(app.server)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send(rental);

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: newUser.email, password: newUser.password });

    const response = await request(app.server)
      .get(`/rentals/${responseCreate.body.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should not be able to get a rental with non-existent rental', async () => {
    const response = await request(app.server)
      .get('/rentals/f43e4af9-fba8-4fe0-90f1-58ad8fca125b')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Rental not found');
  });

  // DELETE
});
