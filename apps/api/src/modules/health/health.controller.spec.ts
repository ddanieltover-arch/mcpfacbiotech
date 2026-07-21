import { HealthController } from './health.controller';

describe('HealthController', () => {
  const emailService = { isEnabled: jest.fn().mockReturnValue(true) };

  it('reports healthy database', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const controller = new HealthController(prisma as never, emailService as never);
    const result = await controller.check();
    expect(result.data.database).toBe('healthy');
    expect(result.data.email).toBe('configured');
    expect(result.data.status).toBe('ok');
  });

  it('reports unhealthy database on query failure', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('down')) };
    const controller = new HealthController(prisma as never, emailService as never);
    const result = await controller.check();
    expect(result.data.database).toBe('unhealthy');
  });
});
