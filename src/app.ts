import fastify from 'fastify';
import { routes } from 'web/routes/routes';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { errorHandler } from 'middleware/errorHandler';

const app = fastify();

app.register(cors, {
  origin: '*',
});

app.register(fastifyJwt, {
  secret: 'secret_key',
});

app.setErrorHandler(errorHandler);

app.register(routes);

export { app };
