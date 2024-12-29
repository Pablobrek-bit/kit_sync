import { prisma } from 'lib/prisma';
import { app } from '../../app';
import request from 'supertest';

describe('User API Integration Tests', () => {
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
    await prisma.user.deleteMany();

    await request(app.server).post('/users').send(user);

    const loginResponse = await request(app.server)
      .post('/auth')
      .send({ email: user.email, password: user.password });

    token = loginResponse.body.token;
  });

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

    expect(response.status).toBe(500);
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

    const response = await request(app.server)
      .delete(`/users/${responseCreate.body.user.id}`)
      .set('Authorization', `Bearer ${token}`);

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

    const response = await request(app.server)
      .delete(`/users/${responseCreate.body.user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Unauthorized');
  });

  // it('should not be able to delete a user with invalid token', async () => {
  //   const newUser = {
  //     name: 'Pablo',
  //     email: 'pablo@gmail.com',
  //     password: '123456',
  //   };

  //   const responseCreate = await request(app.server)
  //     .post('/users')
  //     .send(newUser);

  //   const response = await request(app.server)
  //     .delete(`/users/${responseCreate.body.user.id}`)
  //     .set('Authorization', `Bearer invalid-token`);

  //   expect(response.status).toBe(500);
  // });

  // it('should be able to delete a user if the user be admin', async () => {
  //   const newUser = {
  //     name: 'Pablo',
  //     email: 'pablo@gmail.com',
  //     password: '123456',
  //   };

  //   const responseCreate = await request(app.server)
  //     .post('/users')
  //     .send(newUser);

  //   const response = await request(app.server)
  //     .delete(`/users/${responseCreate.body.user.id}`)
  //     .set('Authorization', `Bearer invalid-token`);

  //   expect(response.status).toBe(500);
  // });

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

    expect(response.status).toBe(500);
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

  it('should be able to get all users without any filter', async () => {
    const response = await request(app.server)
      .get('/users/index')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
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

    expect(response.status).toBe(500);
  });

  it('should be able to get all users with name filter', async () => {
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
