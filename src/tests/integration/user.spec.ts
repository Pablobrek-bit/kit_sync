import { prisma } from 'lib/prisma';
import { app } from '../../app';
import request from 'supertest';
import { Role } from '@prisma/client';

describe('User API Integration Tests', () => {
  let token: string;
  const user = {
    name: 'Pablo',
    email: 'pabloTest@gmail.com',
    password: '$2a$08$G/99UQeyOAOix2dpDmNXjuCj2g5qhF5Iwa5DvC6g2xichVTAOE02e',
    role: Role.ADMIN,
  };

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: user.email, password: '123456' });

    token = loginResponse.body.token;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  // CREATE
  it('should be able to create a new user', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
  });

  it('should not be able to create a new user with an existing email', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Email already exists' });
  });

  it('should not create a user with invalid email', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'invalid-email',
      password: '123456',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not create a user with invalid password', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user with invalid name', async () => {
    const newUser = {
      name: 1,
      email: 'pablo@gmail.com',
      password: '123456',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user without name', async () => {
    const newUser = {
      email: 'pablo@gmail.com',
      password: '123456',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user without email', async () => {
    const newUser = {
      name: 'Pablo',
      password: '123456',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user without password', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  // LOGIN
  it('should be able to login', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server).post('/auth').send({
      email: newUser.email,
      password: newUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to login with invalid email', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server).post('/auth').send({
      email: 'invalid email',
      password: newUser.password,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login with invalid password', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server).post('/auth').send({
      email: newUser.email,
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login with wrong password', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server).post('/auth').send({
      email: newUser.email,
      password: '1234567',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to login with wrong password', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server).post('/auth').send({
      email: 'pablo1@gmail.com',
      password: '123456',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to login with invalid email and password', async () => {
    const response = await request(app.server).post('/auth').send({
      email: 'invalid email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login without email', async () => {
    const response = await request(app.server).post('/auth').send({
      password: '123456',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login without password', async () => {
    const response = await request(app.server).post('/auth').send({
      email: 'pablo@gmail.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login without email and password', async () => {
    const response = await request(app.server).post('/auth').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  // GET
  it('should be able to get user profile', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to get user profile without token', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server).get('/users');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is missing');
  });

  it('should not be able to get user profile with invalid token', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  // DELETE
  it('should be able to delete a user', async () => {
    const newUser = {
      name: 'test',
      email: 'test@gmail.com',
      password: '123456',
    };

    const responseCreate = await request(app.server)
      .post('/users')
      .send(newUser);

    const response = await request(app.server)
      .delete(`/users/${responseCreate.body.user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const user = await prisma.user.findUnique({
      where: { id: responseCreate.body.user.id },
    });

    expect(user).toBeNull();
  });

  it('should not be able to delete a user if the user not be admin', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    const responseCreate = await request(app.server)
      .post('/users')
      .send(newUser);

    const responseAuth = await request(app.server).post('/auth').send({
      email: newUser.email,
      password: newUser.password,
    });

    const response = await request(app.server)
      .delete(`/users/${responseCreate.body.user.id}`)
      .set('Authorization', `Bearer ${responseAuth.body.token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Unauthorized');
  });

  it('should not be able to delete a user without token', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    const responseCreate = await request(app.server)
      .post('/users')
      .send(newUser);

    const response = await request(app.server).delete(
      `/users/${responseCreate.body.user.id}`,
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is missing');
  });

  it('should not be able to delete a user with invalid token', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    const responseCreate = await request(app.server)
      .post('/users')
      .send(newUser);

    const response = await request(app.server)
      .delete(`/users/${responseCreate.body.user.id}`)
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should not be able to delete a user with invalid id', async () => {
    const response = await request(app.server)
      .delete('/users/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to delete a user with invalid id', async () => {
    const response = await request(app.server)
      .delete('/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  // UPDATE
  it('should be able to update a user', async () => {
    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Pablo Henrique' });

    expect(response.status).toBe(200);
    expect(response.body.name).toEqual('Pablo Henrique');
  });

  it('should not be able to update a user without token', async () => {
    const response = await request(app.server)
      .put('/users')
      .send({ name: 'Pablo Henrique' });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is missing');
  });

  it('should not be able to update a user with invalid token', async () => {
    const response = await request(app.server)
      .put('/users')
      .send({ name: 'Pablo Henrique' })
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should not be able to update a user with invalid name', async () => {
    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 123 });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid email', async () => {
    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid password', async () => {
    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid password', async () => {
    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 123 });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid name', async () => {
    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 123 });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  // INDEX
  it('should be able to get all users without any filter', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const response = await request(app.server)
      .get('/users/index')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should not be able to get all users without token', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const response = await request(app.server).get('/users/index');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is missing');
  });

  it('should not be able to get all users with invalid token', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const response = await request(app.server)
      .get('/users/index')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  it('should be able to get all users with name filter', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ name: 'Pablo' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with email filter', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ email: 'pablo@gmail.com' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should be able to get all users with createdAt filter', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ createdAt: new Date().toISOString().split('T')[0] })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with updatedAt filter', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ updatedAt: new Date().toISOString().split('T')[0] })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with sort name and order asc', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'name', order: 'asc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with sort createdAt and order asc', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'createdAt', order: 'asc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with sort updatedAt and order asc', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'updatedAt', order: 'asc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with sort name and order desc', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'name', order: 'desc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get one user with filter size', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ size: 1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should be able to get one user with filter page', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ page: 1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get one user with filter page and size', async () => {
    await prisma.user.update({
      where: { email: user.email },
      data: { role: 'ADMIN' },
    });

    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ page: 1, size: 1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should be able to get one user with filter page and size and sort name and order asc', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo@gmail.com',
      password: '123456',
    };

    await request(app.server).post('/users').send(newUser);

    const response = await request(app.server)
      .get('/users/index')
      .query({ page: 1, size: 1, sort: 'name', order: 'asc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

// "test:integration": "docker-compose up -d site_kit_sync_test_db && timeout /t 5 && npx prisma migrate deploy --schema=./prisma/schema.test.prisma && npx jest --testPathPattern='tests/integration/.*\\.spec\\.ts$' --runInBand && docker-compose stop site_kit_sync_test_db && docker-compose rm -f site_kit_sync_test_db"
