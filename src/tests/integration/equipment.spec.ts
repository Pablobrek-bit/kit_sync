import { app } from 'app';
import request from 'supertest';
import { prisma } from 'lib/prisma';

describe('Equipment API Integration Tests', () => {
  let token: string;
  const user = {
    name: 'Pablo',
    email: 'pabloTest@gmail.com',
    password: '123456',
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
  });

  afterEach(async () => {
    await prisma.equipment.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should be able to create a new equipment', async () => {
    const response = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.equipament).toHaveProperty('id');
  });

  it('should not be able to create a new equipment without token', async () => {
    const response = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      });

    expect(response.status).toBe(401);
  });

  it('should not be able to create a new equipment with invalid data', async () => {
    const response = await request(app.server)
      .post('/equipments')
      .send({
        name: 111,
        description: 23,
        category: 12,
        dailyPrice: -100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a new equipment with invalid token', async () => {
    const response = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer invalidToken`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should be able to get a equipment by id', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .get(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipament).toHaveProperty('id');
  });

  it('should not be able to get a equipment by id without token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server).get(
      `/equipments/${equipament.id}`,
    );

    expect(response.status).toBe(401);
  });

  it('should not be able to get a equipment by id with invalid token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .get(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer invalidToken`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should not be able to get a equipment by id with invalid id', async () => {
    const response = await request(app.server)
      .get(`/equipments/invalidId`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe(
      'Equipment with this id does not exists',
    );
  });

  it('should be able to delete a equipment by id', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .delete(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should not be able to delete a equipment by id without token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server).delete(
      `/equipments/${equipament.id}`,
    );

    expect(response.status).toBe(401);
  });

  it('should not be able to delete a equipment by id with invalid token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .delete(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer invalidToken`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should not be able to delete a equipment by id with invalid id', async () => {
    const response = await request(app.server)
      .delete(`/equipments/invalidId`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Equipament not found');
    expect(response.status).toBe(400);
  });

  it('should not be able to delete a equipment by id with invalid user', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const otherUser = {
      name: 'Pablo1',
      email: 'pabloTest1@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(otherUser);

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: otherUser.email, password: otherUser.password });

    const otherToken = loginResponse.body.token;

    const response = await request(app.server)
      .delete(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.body.message).toBe(
      'You are not allowed to delete this equipament',
    );
    expect(response.status).toBe(400);
  });

  it('should be able to update a equipment by id', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .put(`/equipments/${equipament.id}`)
      .send({
        name: 'Equipment Test Updated',
        description: 'Equipment Test Description Updated',
        category: 'Equipment Test Category Updated',
        dailyPrice: 200,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipment).toHaveProperty('id');
  });

  it('should not be able to update a equipment by id without token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .put(`/equipments/${equipament.id}`)
      .send({
        name: 'Equipment Test Updated',
        description: 'Equipment Test Description Updated',
        category: 'Equipment Test Category Updated',
        dailyPrice: 200,
        photos: ['photo1', 'photo2', 'photo3'],
      });

    expect(response.status).toBe(401);
  });

  it('should not be able to update a equipment by id with invalid token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .put(`/equipments/${equipament.id}`)
      .send({
        name: 'Equipment Test Updated',
        description: 'Equipment Test Description Updated',
        category: 'Equipment Test Category Updated',
        dailyPrice: 200,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer invalidToken`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should not be able to update a equipment by id with invalid user', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const otherUser = {
      name: 'Pablo',
      email: 'Pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(otherUser);

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: otherUser.email, password: otherUser.password });

    const otherToken = loginResponse.body.token;

    const response = await request(app.server)
      .put(`/equipments/${equipament.id}`)
      .send({
        name: 'Equipment Test Updated',
        description: 'Equipment Test Description Updated',
        category: 'Equipment Test Category Updated',
        dailyPrice: 200,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.body.message).toBe(
      'You are not the owner of this equipment',
    );
    expect(response.status).toBe(400);
  });

  it('should not be able to update a equipment by id with invalid data', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .put(`/equipments/${equipament.id}`)
      .send({
        name: 123,
        description: 123,
        category: 123,
        dailyPrice: -100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to update a equipment by id with invalid data', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .put(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Validation error');
    expect(response.status).toBe(400);
  });

  it('should not be able to update a equipment by id with invalid id', async () => {
    const response = await request(app.server)
      .put(`/equipments/invalidId`)
      .send({
        name: 'Equipment Test Updated',
        description: 'Equipment Test Description Updated',
        category: 'Equipment Test Category Updated',
        dailyPrice: 200,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Equipment not found');
  });

  it('should not be able to update a equipment by id with invalid id', async () => {
    const response = await request(app.server)
      .put(`/equipments/invalidId`)
      .send({
        name: 'Equipment Test Updated',
        description: 'Equipment Test Description Updated',
        category: 'Equipment Test Category Updated',
        dailyPrice: 200,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Equipment not found');
  });

  it('should be able to list all equipments', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 1',
        description: 'Equipment Test Description 1',
        category: 'Equipment Test Category 1',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 2',
        description: 'Equipment Test Description 2',
        category: 'Equipment Test Category 2',
        dailyPrice: 200,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .get(`/equipments`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(2);
  });

  it('should not be able to list all equipments without token', async () => {
    const response = await request(app.server).get(`/equipments`);

    expect(response.status).toBe(401);
  });

  it('should not be able to list all equipments with invalid token', async () => {
    const response = await request(app.server)
      .get(`/equipments`)
      .set('Authorization', `Bearer invalidToken`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should be able to list all equipments by category', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 1',
        description: 'Equipment Test Description 1',
        category: 'Category 1',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 2',
        description: 'Equipment Test Description 2',
        category: 'Category 2',
        dailyPrice: 200,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .get(`/equipments?category=Category 1`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by name', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 1',
        description: 'Equipment Test Description 1',
        category: 'Category 1',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 2',
        description: 'Equipment Test Description 2',
        category: 'Category 2',
        dailyPrice: 200,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .get(`/equipments?name=Equipment Test 1`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by price', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 1',
        description: 'Equipment Test Description 1',
        category: 'Category 1',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 2',
        description: 'Equipment Test Description 2',
        category: 'Category 2',
        dailyPrice: 200,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .get(`/equipments?dailyPrice=100`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by category and price', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 1',
        description: 'Equipment Test Description 1',
        category: 'Category 1',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 2',
        description: 'Equipment Test Description 2',
        category: 'Category 2',
        dailyPrice: 200,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .get(`/equipments?category=Category 1&dailyPrice=100`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by name, category and price', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 1',
        description: 'Equipment Test Description 1',
        category: 'Category 1',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 2',
        description: 'Equipment Test Description 2',
        category: 'Category 2',
        dailyPrice: 200,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .get(
        `/equipments?name=Equipment Test 1&category=Category 1&dailyPrice=100`,
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to upload a photo to a equipment', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .post(`/equipments/${equipament.id}/photos`)
      .set('Authorization', `Bearer ${token}`)
      .send({ photos: ['photo1', 'photo2'] });

    const responseGet = await request(app.server)
      .get(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(responseGet.body.equipament.photos).toEqual([
      'photo3',
      'photo1',
      'photo2',
    ]);
  });

  it('should not be able to upload a photo to a equipment without token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: [],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .post(`/equipments/${equipament.id}/photos`)
      .send({ photos: ['photo1', 'photo2'] });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to upload a photo to a equipment with invalid token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: [],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .post(`/equipments/${equipament.id}/photos`)
      .set('Authorization', `Bearer invalidToken`)
      .send({ photos: ['photo1', 'photo2'] });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should not be able to upload a photo to a equipment with invalid id', async () => {
    const response = await request(app.server)
      .post(`/equipments/invalidId/photos`)
      .set('Authorization', `Bearer ${token}`)
      .send({ photos: ['photo1', 'photo2'] });

    expect(response.status).toBe(400);
  });

  it('should be able to delete a photo from a equipment', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .delete(`/equipments/${equipament.id}/photos/photo1`)
      .set('Authorization', `Bearer ${token}`);

    const responseGet = await request(app.server)
      .get(`/equipments/${equipament.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(responseGet.body.equipament.photos).toEqual(['photo2', 'photo3']);
  });

  it('should not be able to delete a photo from a equipment without token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server).delete(
      `/equipments/${equipament.id}/photos/photo1`,
    );

    expect(response.status).toBe(401);
  });

  it('should not be able to delete a photo from a equipment with invalid token', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .delete(`/equipments/${equipament.id}/photos/photo1`)
      .set('Authorization', `Bearer invalidToken`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should not be able to delete a photo from a equipment with invalid id', async () => {
    const response = await request(app.server)
      .delete(`/equipments/invalidId/photos/photo1`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('should not be able to delete a photo from a equipment with invalid photo id', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const response = await request(app.server)
      .delete(`/equipments/${equipament.id}/photos/invalidPhotoId`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Photo not found');
  });

  it('should not be able to delete a photo from a equipment with invalid user', async () => {
    const equipmentResponse = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2', 'photo3'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = equipmentResponse.body;

    const otherUser = {
      name: 'Pablo1',
      email: 'pablo1@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(otherUser);

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: otherUser.email, password: otherUser.password });

    const otherToken = loginResponse.body.token;

    const response = await request(app.server)
      .delete(`/equipments/${equipament.id}/photos/photo1`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.body.message).toBe('User does not have permission');
    expect(response.status).toBe(400);
  });

  it('should be able to list all equipments by user', async () => {
    const responseCreate = await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const { equipament } = responseCreate.body;

    const response = await request(app.server)
      .get(`/equipments/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
    expect(response.body.equipments[0].id).toBe(equipament.id);
  });

  it('should not be able to list all equipments by user without token', async () => {
    const response = await request(app.server).get(`/equipments/me`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to list all equipments by user with invalid token', async () => {
    const response = await request(app.server)
      .get(`/equipments/me`)
      .set('Authorization', `Bearer invalidToken`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is invalid');
  });

  it('should be able to list all equipments by user with invalid user', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test',
        description: 'Equipment Test Description',
        category: 'Equipment Test Category',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const otherUser = {
      name: 'Pablo1',
      email: 'pablo1@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(otherUser);

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: otherUser.email, password: otherUser.password });

    const otherToken = loginResponse.body.token;

    const response = await request(app.server)
      .get(`/equipments/me`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.body.equipments).toHaveLength(0);
  });

  it('should be able to list all equipments by user with no equipments', async () => {
    const response = await request(app.server)
      .get(`/equipments/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(0);
  });

  it('should be able to list all equipments by user with multiple equipments', async () => {
    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 1',
        description: 'Equipment Test Description 1',
        category: 'Equipment Test Category 1',
        dailyPrice: 100,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    await request(app.server)
      .post('/equipments')
      .send({
        name: 'Equipment Test 2',
        description: 'Equipment Test Description 2',
        category: 'Equipment Test Category 2',
        dailyPrice: 200,
        photos: ['photo1', 'photo2'],
      })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app.server)
      .get(`/equipments/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(2);
  });
});
