import fastify from 'fastify';
import { routes } from 'web/routes/routes';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';

const app = fastify();

app.register(cors, {
  origin: '*',
});

app.register(fastifyJwt, {
  secret: 'supersecret',
});

app.register(routes);

export { app };
