import { app } from 'app';
import { env } from 'env';

app.listen({ port: env.PORT, host: '0.0.0.0' }, () => {
  console.log(
    `Server is running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`,
  );
});
