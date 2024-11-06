import fastify from 'fastify';
import { routes } from 'web/routes/routes';
import cors from '@fastify/cors';

const app = fastify();

app.register(cors, {
  origin: '*',
});

app.register(routes);

export { app };
