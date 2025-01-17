import { prisma } from 'lib/prisma';
import { app } from '../../app';
import request from 'supertest';
import { Role } from '@prisma/client';
import { hash } from 'bcryptjs';

describe('User API Integration Tests', () => {
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

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const user = userFactory({
      role: Role.ADMIN,
      email: 'admin@gmail.com',
      name: 'admin',
    });
    token = (await authenticateUser(user)).token;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  // CREATE
  it('should be able to create a new user', async () => {
    const user = userFactory({ role: Role.USER, email: 'test@gmail.com' });

    const response = await request(app.server).post('/users').send(user);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toEqual(user.email);
  });

  it('should not be able to create a new user with an existing email', async () => {
    await authenticateUser(userFactory({ email: 'test@gmail.com' }));

    const response = await request(app.server)
      .post('/users')
      .send(userFactory({ email: 'test@gmail.com' }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Email already exists' });
  });

  it('should not create a user with invalid email', async () => {
    const user = userFactory({ role: Role.USER, email: 'invalidEmail' });

    const response = await request(app.server).post('/users').send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not create a user with invalid password', async () => {
    const user = userFactory({ role: Role.USER, password: '123' });

    const response = await request(app.server).post('/users').send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user with invalid name', async () => {
    const user = {
      name: 123,
      password: '123456',
      email: 'user@gmail.com',
    };

    const response = await request(app.server).post('/users').send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user without name', async () => {
    const user = userFactory({ role: Role.USER, email: 'test@gmail.com' });

    user.name = '';

    const response = await request(app.server).post('/users').send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user without email', async () => {
    const user = userFactory({ role: Role.USER });

    user.email = '';

    const response = await request(app.server).post('/users').send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to create a new user without password', async () => {
    const user = userFactory({ role: Role.USER });

    user.password = '';

    const response = await request(app.server).post('/users').send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  // LOGIN
  it('should be able to login', async () => {
    const user = (await authenticateUser(userFactory())).user;

    const responseLogin = await request(app.server).post('/auth').send({
      email: user.email,
      password: '123456',
    });

    expect(responseLogin.status).toBe(200);
    expect(responseLogin.body).toHaveProperty('token');
  });

  it('should not be able to login with invalid email', async () => {
    const user = (await authenticateUser(userFactory())).user;

    const response = await request(app.server).post('/auth').send({
      email: 'invalid email',
      password: user.password,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login with invalid password', async () => {
    const user = (await authenticateUser(userFactory())).user;

    const response = await request(app.server).post('/auth').send({
      email: user.email,
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login with wrong password', async () => {
    const user = (await authenticateUser(userFactory())).user;

    const response = await request(app.server).post('/auth').send({
      email: user.email,
      password: '1234567',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to login with wrong password', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server).post('/auth').send({
      email: 'pablo1@gmail.com',
      password: '123456',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to login with invalid email and password', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server).post('/auth').send({
      email: 'invalid email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login without email', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server).post('/auth').send({
      password: '123456',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login without password', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server).post('/auth').send({
      email: 'pablo@gmail.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to login without email and password', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server).post('/auth').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  // GET
  it('should be able to get user profile', async () => {
    const { user, token } = await authenticateUser(userFactory());

    const response = await request(app.server)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toEqual(user.email);
  });

  it('should not be able to get user profile without token', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server).get('/users');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is missing');
  });

  it('should not be able to get user profile with invalid token', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server)
      .get('/users')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });

  // DELETE
  it('should be able to delete a user', async () => {
    const authenticatedUser = (await authenticateUser(userFactory())).user;

    const response = await request(app.server)
      .delete(`/users/${authenticatedUser.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const getUser = await prisma.user.findUnique({
      where: { id: authenticatedUser.id },
    });

    expect(getUser).toBeNull();
  });

  it('should not be able to delete a user if the user not be admin', async () => {
    const { token } = await authenticateUser(userFactory());

    const otherUser = (
      await authenticateUser(userFactory({ email: 'test1@gmail.com' }))
    ).user;

    const response = await request(app.server)
      .delete(`/users/${otherUser.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Unauthorized');
  });

  it('should not be able to delete a user without token', async () => {
    const otherUser = (
      await authenticateUser(userFactory({ email: 'test1@gmail.com' }))
    ).user;

    const response = await request(app.server).delete(`/users/${otherUser.id}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is missing');
  });

  it('should not be able to delete a user with invalid token', async () => {
    const otherUser = (
      await authenticateUser(userFactory({ email: 'test1@gmail.com' }))
    ).user;

    const response = await request(app.server)
      .delete(`/users/${otherUser.id}`)
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

  // UPDATE
  it('should be able to update a user', async () => {
    const { token: otherToken } = await authenticateUser(
      userFactory({ email: 'test1@gmail.com' }),
    );

    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ email: 'test2@gmail.com' });

    expect(response.status).toBe(200);
    expect(response.body.email).toEqual('test2@gmail.com');
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
    const { token: otherToken } = await authenticateUser(
      userFactory({ email: 'test1@gmail.com' }),
    );

    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 123 });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid email', async () => {
    const { token: otherToken } = await authenticateUser(
      userFactory({ email: 'test1@gmail.com' }),
    );

    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ email: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid password', async () => {
    const { token: otherToken } = await authenticateUser(
      userFactory({ email: 'test1@gmail.com' }),
    );

    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid password', async () => {
    const { token: otherToken } = await authenticateUser(
      userFactory({ email: 'test1@gmail.com' }),
    );

    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ password: 123 });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  it('should not be able to update a user with invalid name', async () => {
    const { token: otherToken } = await authenticateUser(
      userFactory({ email: 'test1@gmail.com' }),
    );

    const response = await request(app.server)
      .put('/users')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 123 });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Validation error');
  });

  // INDEX
  it('should be able to get all users without any filter', async () => {
    await authenticateUser(userFactory({ email: 'test1@gmail.com' }));

    await authenticateUser(userFactory({ email: 'test2@gmail.com' }));

    const response = await request(app.server)
      .get('/users/index')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
  });

  it('should not be able to get all users without token', async () => {
    const response = await request(app.server).get('/users/index');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is missing');
  });

  it('should not be able to get all users with invalid token', async () => {
    const response = await request(app.server)
      .get('/users/index')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Authorization header is invalid');
  });
  it('should be able to get all users with name filter', async () => {
    await authenticateUser(
      userFactory({ name: 'Pablo', email: 'test1@gmail.com' }),
    );

    await authenticateUser(
      userFactory({ name: 'Pablo', email: 'test2@gmail.com' }),
    );

    const response = await request(app.server)
      .get('/users/index')
      .query({ name: 'Pablo' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('should be able to get all users with email filter', async () => {
    await authenticateUser(userFactory({ email: 'test@gmail.com' }));

    await authenticateUser(userFactory({ email: 'pablo@gmail.com' }));

    const response = await request(app.server)
      .get('/users/index')
      .query({ email: 'pablo@gmail.com' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should be able to get all users with createdAt filter', async () => {
    await authenticateUser(userFactory({ name: 'Pablo' }));

    const response = await request(app.server)
      .get('/users/index')
      .query({ createdAt: new Date().toISOString().split('T')[0] })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('should be able to get all users with updatedAt filter', async () => {
    await authenticateUser(
      userFactory({ name: 'Pablo', email: 'test1@gmail.com' }),
    );
    await authenticateUser(
      userFactory({ name: 'Pablo', email: 'test2@gmail.com' }),
    );

    const response = await request(app.server)
      .get('/users/index')
      .query({ updatedAt: new Date().toISOString().split('T')[0] })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
  });

  it('should be able to get all users with sort name and order asc', async () => {
    await authenticateUser(
      userFactory({ name: 'Pablo', email: 'test1@gmail.com' }),
    );
    await authenticateUser(
      userFactory({ name: 'Pedro', email: 'test2@gmail.com' }),
    );

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'name', order: 'asc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[1].name).toEqual('Pablo');
  });

  it('should be able to get all users with sort createdAt and order asc', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'createdAt', order: 'asc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with sort updatedAt and order asc', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'updatedAt', order: 'asc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get all users with sort name and order desc', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server)
      .get('/users/index')
      .query({ sort: 'name', order: 'desc' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get one user with filter size', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server)
      .get('/users/index')
      .query({ size: 1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should be able to get one user with filter page', async () => {
    await authenticateUser(userFactory());

    const response = await request(app.server)
      .get('/users/index')
      .query({ page: 1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to get one user with filter page and size', async () => {
    await authenticateUser(userFactory());

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
