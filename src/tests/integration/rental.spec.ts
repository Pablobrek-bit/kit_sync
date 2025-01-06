// import { app } from 'app';
// import request from 'supertest';
// import { prisma } from 'lib/prisma';
// import type { Equipment } from '@prisma/client';

// describe('Rental API Integration Tests', () => {
//   let token: string;
//   let equipmentCreated: Equipment;
//   //criar o startAt um dia depois de hoje e o endAt um dia depois do startAt
//   const startAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
//     .toISOString()
//     .split('T')[0];
//   const endAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 2)
//     .toISOString()
//     .split('T')[0];

//   const user = {
//     name: 'Pablo',
//     email: 'pabloTest@gmail.com',
//     password: '123456',
//   };

//   const equipment = {
//     name: 'Equipment Test',
//     description: 'Equipment Test Description',
//     category: 'Equipment Test Category',
//     dailyPrice: 100,
//     photos: ['photo1', 'photo2'],
//   };

//   beforeAll(async () => {
//     await app.ready();
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   beforeEach(async () => {
//     await request(app.server).post('/users').send(user);

//     const loginResponse = await request(app.server)
//       .post('/auth')
//       .send({ email: user.email, password: user.password });

//     token = loginResponse.body.token;

//     const responseEquipment = await request(app.server)
//       .post('/equipments')
//       .set('Authorization', `Bearer ${token}`)
//       .send(equipment);

//     equipmentCreated = responseEquipment.body.equipament;
//   });

//   afterEach(async () => {
//     await prisma.rental.deleteMany();
//     await prisma.user.deleteMany();
//     await prisma.equipment.deleteMany();
//   });

//   // CREATE
//   it('should be create a new rental', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const response = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     expect(response.status).toBe(201);
//     expect(response.body).toHaveProperty('id');
//     expect(response.body.equipmentId).toBe(equipmentCreated.id);
//   });

//   it('should not be able to create a rental with invalid equipment', async () => {
//     const rental = {
//       equipmentId: 'invalid-id',
//       startAt,
//       endAt,
//     };

//     const response = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Equipment not found');
//   });

//   it('should not be able to create a rental with invalid date range', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt: endAt,
//       endAt: startAt,
//     };

//     const response = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Invalid date range');
//   });

//   it('should not be able to create a rental with equipment not available', async () => {
//     await prisma.equipment.update({
//       where: { id: equipmentCreated.id },
//       data: { available: false },
//     });

//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const response = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Equipment not available');
//   });

//   it('should not be able to create a rental without authentication', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const response = await request(app.server).post('/rentals').send(rental);

//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe('Authorization header is missing');
//   });

//   it('should not be able to create a rental without equipmentId', async () => {
//     const rental = {
//       startAt,
//       endAt,
//     };

//     const response = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to create a rental without startAt', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       endAt,
//     };

//     const response = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to create a rental without endAt', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//     };

//     const response = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   // GET
//   it('should be able to get a rental', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .get(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('id');
//     expect(response.body.equipmentId).toBe(equipmentCreated.id);
//   });

//   it('should not be able to get a rental with invalid id', async () => {
//     const response = await request(app.server)
//       .get('/rentals/invalid-id')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to get a rental without authentication', async () => {
//     const response = await request(app.server).get('/rentals/1');

//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe('Authorization header is missing');
//   });

//   it('should not be able to get a rental with invalid user', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .get(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer invalid-token`);

//     expect(response.status).toBe(401);
//     expect(response.body.message).toEqual('Authorization header is invalid');
//   });

//   it('should not be able to get a rental with unauthorized user', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const newUser = {
//       name: 'Pablo',
//       email: 'pablo@gmail.com',
//       password: '123456',
//     };

//     await request(app.server).post('/users').send(newUser);

//     const loginResponse = await request(app.server)
//       .post('/auth')
//       .send({ email: newUser.email, password: newUser.password });

//     const response = await request(app.server)
//       .get(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${loginResponse.body.token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Unauthorized');
//   });

//   it('should not be able to get a rental with non-existent rental', async () => {
//     const response = await request(app.server)
//       .get('/rentals/f43e4af9-fba8-4fe0-90f1-58ad8fca125b')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Rental not found');
//   });

//   // DELETE
//   it('should be able to delete a rental', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .delete(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ status: 'CANCELLED' });

//     const responseGet = await request(app.server)
//       .get(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(204);
//     expect(responseGet.body.status).toBe('CANCELLED');
//   });

//   it('should not be able to delete a rental with invalid id', async () => {
//     const response = await request(app.server)
//       .delete('/rentals/invalid-id')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ status: 'CANCELLED' });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to delete a rental without authentication', async () => {
//     const response = await request(app.server).delete('/rentals/1');

//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe('Authorization header is missing');
//   });

//   it('should not be able to delete a rental with invalid status', async () => {
//     const response = await request(app.server)
//       .delete('/rentals/f43e4af9-fba8-4fe0-90f1-58ad8fca125b')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ status: 'INVALID' });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to delete a rental with unauthorized user', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const newUser = {
//       name: 'Pablo',
//       email: 'pablo@gmail.com',
//       password: '123456',
//     };

//     await request(app.server).post('/users').send(newUser);

//     const loginResponse = await request(app.server)
//       .post('/auth')
//       .send({ email: newUser.email, password: newUser.password });

//     const response = await request(app.server)
//       .delete(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${loginResponse.body.token}`)
//       .send({ status: 'CANCELLED' });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe(
//       'You are not allowed to delete this rental',
//     );
//   });

//   it('should not be able to delete a rental with non-existent rental', async () => {
//     const response = await request(app.server)
//       .delete('/rentals/f43e4af9-fba8-4fe0-90f1-58ad8fca125b')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ status: 'CANCELLED' });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Rental not found');
//   });

//   //   UPDATE
//   it('should be able to update a rental', async () => {
//     const newStartAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 2)
//       .toISOString()
//       .split('T')[0];

//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3)
//         .toISOString()
//         .split('T')[0],
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .put(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         startAt: newStartAt,
//       });

//     console.log(response.body);

//     expect(response.status).toBe(200);
//     expect(response.body.rental.startAt.split('T')[0]).toBe(newStartAt);
//   });

//   it('should not be able to update a rental with invalid id', async () => {
//     const response = await request(app.server)
//       .put('/rentals/invalid-id')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ startAt });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to update a rental without authentication', async () => {
//     const response = await request(app.server).put(
//       '/rentals/f43e4af9-fba8-4fe0-90f1-58ad8fca125b',
//     );

//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe('Authorization header is missing');
//   });

//   it('should not be able to update a rental with unauthorized user', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const newUser = {
//       name: 'Pablo',
//       email: 'pablo@gmail.com',
//       password: '123456',
//     };

//     await request(app.server).post('/users').send(newUser);

//     const loginResponse = await request(app.server)
//       .post('/auth')
//       .send({ email: newUser.email, password: newUser.password });

//     const response = await request(app.server)
//       .put(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${loginResponse.body.token}`)
//       .send({ startAt });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe(
//       'You are not allowed to update this rental',
//     );
//   });

//   it('should not be able to update a rental with non-existent rental', async () => {
//     const response = await request(app.server)
//       .put('/rentals/f43e4af9-fba8-4fe0-90f1-58ad8fca125b')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ startAt });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Rental not found');
//   });

//   it('should not be able to update a rental with invalid date range', async () => {
//     const newStartAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3)
//       .toISOString()
//       .split('T')[0];

//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .put(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ startAt: newStartAt });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe(
//       'Start date must be less than the end date',
//     );
//   });

//   it('should not be able to update a rental with invalid start date', async () => {
//     const newStartAtBeforeCurrentDate = new Date(
//       new Date().getTime() - 1000 * 60 * 60 * 24,
//     );

//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .put(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ startAt: newStartAtBeforeCurrentDate });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe(
//       'Start date must be greater than the current date',
//     );
//   });

//   it('should not be able to update a rental with invalid status', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .put(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ status: 'INVALID' });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to update a rental with invalid end date', async () => {
//     const newEndAtBeforeCurrentDate = new Date(
//       new Date().getTime() - 1000 * 60 * 60 * 24,
//     );

//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const responseCreate = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .put(`/rentals/${responseCreate.body.id}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ endAt: newEndAtBeforeCurrentDate });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe(
//       'End date must be greater than the current date',
//     );
//   });

//   // INDEX;
//   it('should be able to list all rentals', async () => {
//     const rental = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental);

//     const response = await request(app.server)
//       .get('/rentals')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body.length).toBe(1);
//   });

//   it('should not be able to list all rentals without authentication', async () => {
//     const response = await request(app.server).get('/rentals');

//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe('Authorization header is missing');
//   });

//   it('should not be able to list all rentals with invalid token', async () => {
//     const response = await request(app.server)
//       .get('/rentals')
//       .set('Authorization', `Bearer invalid-token`);

//     expect(response.status).toBe(401);
//     expect(response.body.message).toEqual('Authorization header is invalid');
//   });

//   it('should be able to list all rentals by equipment', async () => {
//     const rental1 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental2 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental3 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental1);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental2);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental3);

//     const response = await request(app.server)
//       .get(`/rentals?equipmentId=${equipmentCreated.id}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body.length).toBe(3);
//   });

//   it('should be able to list all rentals by status', async () => {
//     const rental1 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental2 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental3 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const response1 = await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental1);

//     await request(app.server)
//       .put(`/rentals/${response1.body.id}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ status: 'ACCEPTED' });

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental2);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental3);

//     const response = await request(app.server)
//       .get('/rentals?status=ACCEPTED')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body.length).toBe(1);
//   });

//   it('should be able to list all rentals by totalMin', async () => {
//     const rental1 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental2 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3)
//         .toISOString()
//         .split('T')[0],
//     };

//     const rental3 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 4)
//         .toISOString()
//         .split('T')[0],
//     };

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental1);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental2);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental3);

//     const response = await request(app.server)
//       .get('/rentals?totalMin=200')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body.length).toBe(2);
//   });

//   it('should be able to list all rentals by totalMax', async () => {
//     const rental1 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental2 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3)
//         .toISOString()
//         .split('T')[0],
//     };

//     const rental3 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 4)
//         .toISOString()
//         .split('T')[0],
//     };

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental1);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental2);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental3);

//     const response = await request(app.server)
//       .get('/rentals?totalMax=200')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body.length).toBe(2);
//   });

//   it('should be able to list all rentals by page', async () => {
//     const rental1 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental2 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     const rental3 = {
//       equipmentId: equipmentCreated.id,
//       startAt,
//       endAt,
//     };

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental1);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental2);

//     await request(app.server)
//       .post('/rentals')
//       .set('Authorization', `Bearer ${token}`)
//       .send(rental3);

//     const response = await request(app.server)
//       .get('/rentals?page=1&size=1')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body.length).toBe(1);
//   });

//   it('should not be able to list all rentals with invalid page', async () => {
//     const response = await request(app.server)
//       .get('/rentals?page=invalid&size=1')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to list all rentals with invalid size', async () => {
//     const response = await request(app.server)
//       .get('/rentals?page=1&size=invalid')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to list all rentals with invalid status', async () => {
//     const response = await request(app.server)
//       .get('/rentals?status=INVALID')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to list all rentals with invalid totalMin', async () => {
//     const response = await request(app.server)
//       .get('/rentals?totalMin=invalid')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to list all rentals with invalid totalMax', async () => {
//     const response = await request(app.server)
//       .get('/rentals?totalMax=invalid')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   it('should not be able to list all rentals with invalid equipmentId', async () => {
//     const response = await request(app.server)
//       .get('/rentals?equipmentId=invalid')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('Validation error');
//   });

//   // TESTAR COM O NOVO PC
//   // it('should be able to list all rentals by startAt', async () => {
//   //   const rental1 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-11-01',
//   //     endAt: '2025-11-02',
//   //   };

//   //   const rental2 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-12-01',
//   //     endAt: '2025-12-02',
//   //   };

//   //   const rental3 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2026-12-01',
//   //     endAt: '2026-12-02',
//   //   };

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental1);

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental2);

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental3);

//   //   const response = await request(app.server)
//   //     .get('/rentals?startAt=2025-11-01')
//   //     .set('Authorization', `Bearer ${token}`);

//   //   expect(response.status).toBe(200);
//   //   expect(response.body.length).toBe(1);
//   // });

//   // it('should be able to list all rentals by endAt', async () => {
//   //   const rental1 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-11-01',
//   //     endAt: '2025-11-02',
//   //   };

//   //   const rental2 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-12-01',
//   //     endAt: '2025-12-02',
//   //   };

//   //   const rental3 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2026-12-01',
//   //     endAt: '2026-12-02',
//   //   };

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental1);

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental2);

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental3);

//   //   const response = await request(app.server)
//   //     .get('/rentals?endAt=2025-11-02')
//   //     .set('Authorization', `Bearer ${token}`);

//   //   expect(response.status).toBe(200);
//   //   expect(response.body.length).toBe(1);
//   // });

//   // it('should be able to list all rentals by createdAt', async () => {
//   //   const rental1 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-11-01',
//   //     endAt: '2025-11-02',
//   //   };

//   //   const rental2 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-12-01',
//   //     endAt: '2025-12-02',
//   //   };

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental1);

//   //   jest.useFakeTimers().setSystemTime(new Date('2025-12-01').getTime());
//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental2);

//   //   jest.useRealTimers();

//   //   const response = await request(app.server)
//   //     .get('/rentals?createdAt=2025-12-01')
//   //     .set('Authorization', `Bearer ${token}`);

//   //   expect(response.status).toBe(200);
//   //   expect(response.body.length).toBe(1);
//   // });

//   // it('should be able to list all rentals by updatedAt', async () => {
//   //   const rental1 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-11-01',
//   //     endAt: '2025-11-02',
//   //   };

//   //   const rental2 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2025-12-01',
//   //     endAt: '2025-12-02',
//   //   };

//   //   const rental3 = {
//   //     equipmentId: equipmentCreated.id,
//   //     startAt: '2026-12-01',
//   //     endAt: '2026-12-02',
//   //   };

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental1);

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental2);

//   //   await request(app.server)
//   //     .post('/rentals')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send(rental3);

//   //   const dataUpdateAt = new Date().toISOString().split('T')[0];

//   //   const response = await request(app.server)
//   //     .get(`/rentals?updatedAt=${dataUpdateAt}`)
//   //     .set('Authorization', `Bearer ${token}`);

//   //   expect(response.status).toBe(200);
//   //   expect(response.body.length).toBe(3);
//   // });

//   //=============================================================
// });
