import { app } from '../../app';
import request from 'supertest';

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be able to create a new user', async () => {
    const newUser = {
      name: 'Pablo',
      email: 'pablo',
      password: '123456',
    };

    const response = await request(app.server).post('/users').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
  });
});

// "test:integration": "docker-compose up -d site_kit_sync_test_db && timeout /t 5 && npx prisma migrate deploy --schema=./prisma/schema.test.prisma && npx jest --testPathPattern='tests/integration/.*\\.spec\\.ts$' --runInBand && docker-compose stop site_kit_sync_test_db && docker-compose rm -f site_kit_sync_test_db"
