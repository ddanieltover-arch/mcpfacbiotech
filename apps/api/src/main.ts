import { Logger } from 'nestjs-pino';
import { createNestApp } from './create-app';

/** Build stamp so Vercel Root Directory `apps/api` picks up monorepo pushes. */
export const API_DEPLOY_STAMP = '2026-07-23-variants-cart-sync';

async function bootstrap() {
  const app = await createNestApp();
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`MCPFAC BIOTECH API running on port ${port} (${API_DEPLOY_STAMP})`);
  logger.log(`Swagger docs available at /api/docs`);
}

bootstrap().catch((error) => {
  console.error('[boot] NestJS bootstrap failed', error);
  throw error;
});
