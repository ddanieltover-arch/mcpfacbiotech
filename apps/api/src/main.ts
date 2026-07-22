import { Logger } from 'nestjs-pino';
import { createNestApp } from './create-app';

async function bootstrap() {
  const app = await createNestApp();
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`MCPFAC BIOTECH API running on port ${port}`);
  logger.log(`Swagger docs available at /api/docs`);
}

bootstrap().catch((error) => {
  console.error('[boot] NestJS bootstrap failed', error);
  throw error;
});
