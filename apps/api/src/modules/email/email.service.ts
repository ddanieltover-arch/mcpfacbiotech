import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  contactAckEmail,
  contactMessageEmail,
  newsletterAdminEmail,
  newsletterWelcomeEmail,
  orderAdminEmail,
  orderConfirmationEmail,
  orderStatusUpdateEmail,
  quoteAdminEmail,
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
      'info@mcpfacbiotech.site';

    return `${name} <${email}>`;
  }

  private getCompanyInbox(): string {
    return this.config.get<string>('COMPANY_EMAIL') ?? 'info@mcpfacbiotech.site';
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

  /** Customer confirmation + admin alert for checkout orders. */
  async sendOrderConfirmation(options: {
    to: string;
    customerName?: string;
    organizationName?: string;
    phone?: string;
    orderNumber: string;
    totalAmount: number;
    subtotal?: number;
    shippingCost?: number;
    taxAmount?: number;
    currency: string;
    paymentMethod?: string;
    shippingMethod?: string;
    purchaseOrderNumber?: string;
    notes?: string;
    shippingAddress?: {
      firstName: string;
      lastName: string;
      organizationName?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      stateProvince?: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
    billingAddress?: {
      firstName: string;
      lastName: string;
      organizationName?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      stateProvince?: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
    items?: Array<{
      productName: string;
      productSku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }): Promise<boolean> {
    const customer = orderConfirmationEmail(options);
    const admin = orderAdminEmail({
      customerName: options.customerName,
      customerEmail: options.to,
      organizationName: options.organizationName,
      phone: options.phone,
      orderNumber: options.orderNumber,
      totalAmount: options.totalAmount,
      subtotal: options.subtotal,
      shippingCost: options.shippingCost,
      taxAmount: options.taxAmount,
      currency: options.currency,
      paymentMethod: options.paymentMethod,
      shippingMethod: options.shippingMethod,
      purchaseOrderNumber: options.purchaseOrderNumber,
      notes: options.notes,
      shippingAddress: options.shippingAddress,
      billingAddress: options.billingAddress,
      items: options.items,
    });

    const [customerSent, adminSent] = await Promise.all([
      this.sendMail({
        to: options.to,
        subject: customer.subject,
        html: customer.html,
      }),
      this.sendMail({
        to: this.getCompanyInbox(),
        subject: admin.subject,
        html: admin.html,
        replyTo: options.to,
      }),
    ]);

    if (!adminSent) {
      this.logger.warn(`Order admin notification failed for ${options.orderNumber}`);
    }

    return customerSent;
  }

  /** Notify the customer whenever an order status changes. */
  async sendOrderStatusUpdate(options: {
    to: string;
    customerName?: string;
    orderNumber: string;
    fromStatus?: string;
    toStatus: string;
    note?: string;
  }): Promise<boolean> {
    const template = orderStatusUpdateEmail(options);
    return this.sendMail({
      to: options.to,
      subject: template.subject,
      html: template.html,
    });
  }

  /** Customer acknowledgement + admin alert for quote requests. */
  async sendQuoteSubmitted(options: {
    to: string;
    customerName?: string;
    quoteNumber: string;
    totalAmount: number;
    currency: string;
  }): Promise<boolean> {
    const customer = quoteSubmittedEmail(options);
    const admin = quoteAdminEmail({
      customerName: options.customerName,
      customerEmail: options.to,
      quoteNumber: options.quoteNumber,
      totalAmount: options.totalAmount,
      currency: options.currency,
    });

    const [customerSent, adminSent] = await Promise.all([
      this.sendMail({
        to: options.to,
        subject: customer.subject,
        html: customer.html,
      }),
      this.sendMail({
        to: this.getCompanyInbox(),
        subject: admin.subject,
        html: admin.html,
        replyTo: options.to,
      }),
    ]);

    if (!adminSent) {
      this.logger.warn(`Quote admin notification failed for ${options.quoteNumber}`);
    }

    return customerSent;
  }

  /** Admin inbox + customer acknowledgement for contact form. */
  async sendContactMessage(options: {
    name: string;
    email: string;
    organization?: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const admin = contactMessageEmail(options);
    const ack = contactAckEmail({
      name: options.name,
      email: options.email,
      subject: options.subject,
    });

    const [adminSent, ackSent] = await Promise.all([
      this.sendMail({
        to: this.getCompanyInbox(),
        subject: admin.subject,
        html: admin.html,
        replyTo: options.email,
      }),
      this.sendMail({
        to: options.email,
        subject: ack.subject,
        html: ack.html,
      }),
    ]);

    if (!ackSent) {
      this.logger.warn(`Contact acknowledgement failed for ${options.email}`);
    }

    return adminSent;
  }

  /** User welcome + admin alert for newsletter subscribe. */
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
