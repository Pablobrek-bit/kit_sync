import { app } from 'app';
import request from 'supertest';
import { prisma } from 'lib/prisma';
import { hash } from 'bcryptjs';

describe('Equipment API Integration Tests', () => {
  let token: string;
  const userFactory = () => ({
    name: 'Pablo',
    email: `user@gmail.com`,
    password: '123456',
  });

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
    return response.body.token;
  };

  const createEquipment = async (
    equipment: ReturnType<typeof equipmentFactory>,
    authToken: string,
  ) => {
    const response = await request(app.server)
      .post('/equipments')
      .send(equipment)
      .set('Authorization', `Bearer ${authToken}`);
    return response;
  };

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const user = userFactory();
    token = await authenticateUser(user);
  });

  afterEach(async () => {
    await prisma.equipment.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should be able to create a new equipment', async () => {
    const equipment = equipmentFactory();
    const response = await createEquipment(equipment, token);

    expect(response.status).toBe(201);
    expect(response.body.equipment).toHaveProperty('id');
  });

  it('should not be able to create a new equipment without token', async () => {
    const equipment = equipmentFactory();
    const response = await request(app.server)
      .post('/equipments')
      .send(equipment);

    expect(response.status).toBe(401);
  });

  it('should not be able to create a new equipment with invalid data', async () => {
    const invalidEquipment = {
      name: 123,
      description: 456,
      category: 789,
      dailyPrice: -100,
      photos: ['photo1'],
    };

    const response = await request(app.server)
      .post('/equipments')
      .send(invalidEquipment)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a new equipment with invalid token', async () => {
    const equipment = equipmentFactory();
    const response = await createEquipment(equipment, 'invalidToken');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });
  it('should be able to get a equipment by id', async () => {
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .get(`/equipments/${equipment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipament).toHaveProperty('id');
  });

  it('should not be able to get a equipment by id without token', async () => {
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;
    const response = await request(app.server).get(
      `/equipments/${equipment.id}`,
    );

    expect(response.status).toBe(401);
  });

  it('should not be able to get a equipment by id with invalid token', async () => {
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .get(`/equipments/${equipment.id}`)
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
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .delete(`/equipments/${equipment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should not be able to delete a equipment by id without token', async () => {
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server).delete(
      `/equipments/${equipment.id}`,
    );

    expect(response.status).toBe(401);
  });

  it('should not be able to delete a equipment by id with invalid token', async () => {
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .delete(`/equipments/${equipment.id}`)
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
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const otherUser = userFactory();
    otherUser.email = 'otherUser@gmail.com';

    const otherToken = await authenticateUser(otherUser);

    const response = await request(app.server)
      .delete(`/equipments/${equipment.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.body.message).toBe(
      'You are not allowed to delete this equipament',
    );
    expect(response.status).toBe(400);
  });

  it('should be able to update a equipment by id', async () => {
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .put(`/equipments/${equipment.id}`)
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
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .put(`/equipments/${equipment.id}`)
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
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .put(`/equipments/${equipment.id}`)
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
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const otherUser = userFactory();
    otherUser.email = 'otherUser@gmail.com';

    const otherToken = await authenticateUser(otherUser);

    const response = await request(app.server)
      .put(`/equipments/${equipment.id}`)
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
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .put(`/equipments/${equipment.id}`)
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
    const equipment = (await createEquipment(equipmentFactory(), token)).body
      .equipment;

    const response = await request(app.server)
      .put(`/equipments/${equipment.id}`)
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
    await createEquipment(equipmentFactory(), token);

    await createEquipment(equipmentFactory(), token);

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
    await createEquipment(equipmentFactory({ category: 'Category 1' }), token);
    await createEquipment(equipmentFactory({ category: 'Category 2' }), token);

    const response = await request(app.server)
      .get(`/equipments?category=Category 1`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by name', async () => {
    await createEquipment(
      equipmentFactory({ name: 'Equipment Test 1' }),
      token,
    );
    await createEquipment(
      equipmentFactory({ name: 'Equipment Test 2' }),
      token,
    );

    const response = await request(app.server)
      .get(`/equipments?name=Equipment Test 1`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by price', async () => {
    await createEquipment(equipmentFactory({ dailyPrice: 100 }), token);
    await createEquipment(equipmentFactory({ dailyPrice: 200 }), token);

    const response = await request(app.server)
      .get(`/equipments?dailyPrice=100`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by category and price', async () => {
    await createEquipment(
      equipmentFactory({ category: 'Category 1', dailyPrice: 100 }),
      token,
    );
    await createEquipment(
      equipmentFactory({ category: 'Category 2', dailyPrice: 200 }),
      token,
    );

    const response = await request(app.server)
      .get(`/equipments?category=Category 1&dailyPrice=100`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to list all equipments by name, category and price', async () => {
    await createEquipment(
      equipmentFactory({
        category: 'Category 1',
        name: 'Equipment Test 1',
        dailyPrice: 100,
      }),
      token,
    );
    await createEquipment(
      equipmentFactory({
        category: 'Category 2',
        name: 'Equipment Test 2',
        dailyPrice: 200,
      }),
      token,
    );

    const response = await request(app.server)
      .get(
        `/equipments?name=Equipment Test 1&category=Category 1&dailyPrice=100`,
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
  });

  it('should be able to upload a photo to a equipment', async () => {
    const equipment = (
      await createEquipment(equipmentFactory({ photos: ['photo3'] }), token)
    ).body.equipment;

    const response = await request(app.server)
      .post(`/equipments/${equipment.id}/photos`)
      .set('Authorization', `Bearer ${token}`)
      .send({ photos: ['photo1', 'photo2'] });

    const responseGet = await request(app.server)
      .get(`/equipments/${equipment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(responseGet.body.equipament.photos).toEqual([
      'photo3',
      'photo1',
      'photo2',
    ]);
  });

  it('should not be able to upload a photo to a equipment without token', async () => {
    const equipment = (
      await createEquipment(equipmentFactory({ photos: ['photo3'] }), token)
    ).body.equipment;

    const response = await request(app.server)
      .post(`/equipments/${equipment.id}/photos`)
      .send({ photos: ['photo1', 'photo2'] });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should not be able to upload a photo to a equipment with invalid token', async () => {
    const equipment = (
      await createEquipment(equipmentFactory({ photos: ['photo3'] }), token)
    ).body.equipment;

    const response = await request(app.server)
      .post(`/equipments/${equipment.id}/photos`)
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
    const equipment = (
      await createEquipment(
        equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
        token,
      )
    ).body.equipment;

    const response = await request(app.server)
      .delete(`/equipments/${equipment.id}/photos/photo1`)
      .set('Authorization', `Bearer ${token}`);

    const responseGet = await request(app.server)
      .get(`/equipments/${equipment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(responseGet.body.equipament.photos).toEqual(['photo3', 'photo2']);
  });

  it('should not be able to delete a photo from a equipment without token', async () => {
    const equipment = (
      await createEquipment(
        equipmentFactory({ photos: ['photo1', 'photo2', 'photo3'] }),
        token,
      )
    ).body.equipment;

    const response = await request(app.server).delete(
      `/equipments/${equipment.id}/photos/photo1`,
    );

    expect(response.status).toBe(401);
  });

  it('should not be able to delete a photo from a equipment with invalid token', async () => {
    const equipment = (
      await createEquipment(
        equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
        token,
      )
    ).body.equipment;

    const response = await request(app.server)
      .delete(`/equipments/${equipment.id}/photos/photo1`)
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
    const equipment = (
      await createEquipment(
        equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
        token,
      )
    ).body.equipment;

    const response = await request(app.server)
      .delete(`/equipments/${equipment.id}/photos/invalidPhotoId`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Photo not found');
  });

  it('should not be able to delete a photo from a equipment with invalid user', async () => {
    const equipment = (
      await createEquipment(
        equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
        token,
      )
    ).body.equipment;

    const otherUser = userFactory();
    otherUser.email = 'otherUser@gmail.com';

    const otherToken = await authenticateUser(otherUser);

    const response = await request(app.server)
      .delete(`/equipments/${equipment.id}/photos/photo1`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.body.message).toBe('User does not have permission');
    expect(response.status).toBe(400);
  });

  it('should be able to list all equipments by user', async () => {
    const equipment = (
      await createEquipment(
        equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
        token,
      )
    ).body.equipment;

    const response = await request(app.server)
      .get(`/equipments/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(1);
    expect(response.body.equipments[0].id).toBe(equipment.id);
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
    await createEquipment(
      equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
      token,
    );

    const otherUser = userFactory();
    otherUser.email = 'otherUser@gmail.com';

    const otherToken = await authenticateUser(otherUser);

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
    await createEquipment(
      equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
      token,
    );

    await createEquipment(
      equipmentFactory({ photos: ['photo3', 'photo2', 'photo1'] }),
      token,
    );

    const response = await request(app.server)
      .get(`/equipments/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.equipments).toHaveLength(2);
  });
});
