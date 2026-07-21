import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  contactMessageEmail,
  newsletterAdminEmail,
  newsletterWelcomeEmail,
  orderConfirmationEmail,
  quoteSubmittedEmail,
} from './email.templates';

type SendMailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  isEnabled(): boolean {
    return this.client != null;
  }

  private getFromAddress(): string {
    const name = this.config.get<string>('RESEND_FROM_NAME') ?? 'MCPFAC BIOTECH';
    const email =
      this.config.get<string>('RESEND_FROM_EMAIL') ??
      this.config.get<string>('COMPANY_EMAIL') ??
      'info@mcpfacbiotech.cn';

    return `${name} <${email}>`;
  }

  private getCompanyInbox(): string {
    return this.config.get<string>('COMPANY_EMAIL') ?? 'info@mcpfacbiotech.cn';
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Email skipped — RESEND_API_KEY is not configured');
      return false;
    }

    try {
      const { error } = await this.client.emails.send({
        from: this.getFromAddress(),
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });

      if (error) {
        this.logger.error(`Resend error: ${error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        'Failed to send email',
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  async sendOrderConfirmation(options: {
    to: string;
    customerName?: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
  }): Promise<boolean> {
    const template = orderConfirmationEmail(options);
    return this.sendMail({
      to: options.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendQuoteSubmitted(options: {
    to: string;
    customerName?: string;
    quoteNumber: string;
    totalAmount: number;
    currency: string;
  }): Promise<boolean> {
    const template = quoteSubmittedEmail(options);
    return this.sendMail({
      to: options.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendContactMessage(options: {
    name: string;
    email: string;
    organization?: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const template = contactMessageEmail(options);
    return this.sendMail({
      to: this.getCompanyInbox(),
      subject: template.subject,
      html: template.html,
      replyTo: options.email,
    });
  }

  async sendNewsletterSubscription(options: { email: string }): Promise<boolean> {
    const welcome = newsletterWelcomeEmail(options);
    const admin = newsletterAdminEmail(options);

    const [welcomeSent, adminSent] = await Promise.all([
      this.sendMail({
        to: options.email,
        subject: welcome.subject,
        html: welcome.html,
      }),
      this.sendMail({
        to: this.getCompanyInbox(),
        subject: admin.subject,
        html: admin.html,
        replyTo: options.email,
      }),
    ]);

    if (!adminSent) {
      this.logger.warn(`Newsletter admin notification failed for ${options.email}`);
    }

    return welcomeSent;
  }
}
