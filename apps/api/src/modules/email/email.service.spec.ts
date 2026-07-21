import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null });
  });

  it('skips sending when RESEND_API_KEY is missing', async () => {
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'RESEND_API_KEY') return undefined;
        if (key === 'COMPANY_EMAIL') return 'info@mcpfacbiotech.cn';
        return undefined;
      }),
    };

    const service = new EmailService(config as unknown as ConfigService);
    const sent = await service.sendOrderConfirmation({
      to: 'lab@example.com',
      orderNumber: 'ORD-1',
      totalAmount: 100,
      currency: 'USD',
    });

    expect(sent).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends order confirmation via Resend', async () => {
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'RESEND_API_KEY') return 're_test_key';
        if (key === 'RESEND_FROM_NAME') return 'MCPFAC BIOTECH';
        if (key === 'RESEND_FROM_EMAIL') return 'info@mcpfacbiotech.cn';
        return undefined;
      }),
    };

    const service = new EmailService(config as unknown as ConfigService);
    const sent = await service.sendOrderConfirmation({
      to: 'lab@example.com',
      customerName: 'Ada',
      orderNumber: 'ORD-1',
      totalAmount: 100,
      currency: 'USD',
    });

    expect(sent).toBe(true);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'MCPFAC BIOTECH <info@mcpfacbiotech.cn>',
        to: ['lab@example.com'],
        subject: 'Order confirmation ORD-1 — MCPFAC BIOTECH',
      }),
    );
  });
});
