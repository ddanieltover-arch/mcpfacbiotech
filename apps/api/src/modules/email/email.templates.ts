/**
 * Branded transactional email templates for Resend.
 * Inline CSS only — compatible with major clients.
 */

const BRAND = {
  deep: '#1B4332',
  natural: '#2D6A4F',
  leaf: '#52B788',
  pale: '#D8F3DC',
  light: '#B7E4C7',
  ink: '#171717',
  muted: '#737373',
  border: '#E5E5E5',
  surface: '#F7F7F5',
  white: '#FFFFFF',
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function siteUrl(): string {
  const raw =
    process.env.FRONTEND_URL?.split(',')[0]?.trim() ||
    process.env.APP_URL ||
    'https://www.mcpfacbiotech.site';
  return raw.replace(/\/$/, '');
}

type DetailRow = { label: string; value: string };

type BrandedEmailOptions = {
  preheader?: string;
  eyebrow?: string;
  title: string;
  greeting?: string;
  intro?: string;
  details?: DetailRow[];
  bodyHtml?: string;
  cta?: { label: string; href: string };
  note?: string;
  footerNote?: string;
};

function detailRowsHtml(rows: DetailRow[]): string {
  if (rows.length === 0) return '';

  const cells = rows
    .map(
      (row, index) => `
        <tr>
          <td style="padding:14px 16px;border-top:${index === 0 ? '0' : `1px solid ${BRAND.border}`};font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.muted};width:38%;vertical-align:top;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:14px 16px;border-top:${index === 0 ? '0' : `1px solid ${BRAND.border}`};font-size:15px;font-weight:600;color:${BRAND.deep};vertical-align:top;">
            ${escapeHtml(row.value)}
          </td>
        </tr>`,
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
      ${cells}
    </table>`;
}

function brandedHtml(options: BrandedEmailOptions): string {
  const year = new Date().getFullYear();
  const base = siteUrl();
  const cta = options.cta
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 8px;">
        <tr>
          <td style="border-radius:8px;background:${BRAND.deep};">
            <a href="${escapeHtml(options.cta.href)}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:700;color:${BRAND.white};text-decoration:none;">
              ${escapeHtml(options.cta.label)}
            </a>
          </td>
        </tr>
      </table>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(options.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.surface};font-family:Manrope,Segoe UI,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
    ${
      options.preheader
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(options.preheader)}</div>`
        : ''
    }
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.surface};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,${BRAND.deep} 0%,${BRAND.natural} 100%);padding:28px 28px 24px;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.leaf};font-weight:700;">
                  MCPFAC BIOTECH
                </p>
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.78);">
                  Learn · Understand · Grow
                </p>
              </td>
            </tr>
            <tr>
              <td style="height:4px;background:${BRAND.leaf};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 28px 12px;">
                ${
                  options.eyebrow
                    ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.natural};font-weight:700;">${escapeHtml(options.eyebrow)}</p>`
                    : ''
                }
                <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:${BRAND.deep};font-weight:700;">
                  ${escapeHtml(options.title)}
                </h1>
                ${
                  options.greeting
                    ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.ink};">${escapeHtml(options.greeting)}</p>`
                    : ''
                }
                ${
                  options.intro
                    ? `<p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#404040;">${escapeHtml(options.intro)}</p>`
                    : ''
                }
                ${detailRowsHtml(options.details ?? [])}
                ${options.bodyHtml ?? ''}
                ${cta}
                ${
                  options.note
                    ? `<p style="margin:20px 0 0;padding:14px 16px;background:${BRAND.pale};border-radius:10px;font-size:13px;line-height:1.6;color:${BRAND.deep};">${escapeHtml(options.note)}</p>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                  ${
                    options.footerNote
                      ? escapeHtml(options.footerNote)
                      : 'For research use only. Not for human or veterinary consumption.'
                  }
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:${BRAND.surface};border-top:1px solid ${BRAND.border};padding:20px 28px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${BRAND.deep};">MCPFAC BIOTECH</p>
                <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                  Research peptides, chemicals &amp; laboratory materials · Shenzhen, China
                </p>
                <p style="margin:0;font-size:12px;color:${BRAND.muted};">
                  <a href="${escapeHtml(base)}" style="color:${BRAND.natural};text-decoration:none;">Website</a>
                  &nbsp;·&nbsp;
                  <a href="${escapeHtml(base)}/support" style="color:${BRAND.natural};text-decoration:none;">Support</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:info@mcpfacbiotech.site" style="color:${BRAND.natural};text-decoration:none;">info@mcpfacbiotech.site</a>
                </p>
                <p style="margin:14px 0 0;font-size:11px;color:#a3a3a3;">
                  © 2016–${year} MCPFAC BIOTECH. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

export function orderConfirmationEmail(options: {
  customerName?: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
}) {
  const amount = formatMoney(options.totalAmount, options.currency);
  const base = siteUrl();

  return {
    subject: `Order confirmation ${options.orderNumber} — MCPFAC BIOTECH`,
    html: brandedHtml({
      preheader: `We received order ${options.orderNumber}. Total ${amount}.`,
      eyebrow: 'Order confirmation',
      title: 'Your order is confirmed',
      greeting: options.customerName ? `Hello ${options.customerName},` : 'Hello,',
      intro:
        'Thank you for ordering with MCPFAC BIOTECH. Our team will review your order and follow up with payment instructions and shipping details.',
      details: [
        { label: 'Order number', value: options.orderNumber },
        { label: 'Order total', value: amount },
      ],
      cta: { label: 'View account orders', href: `${base}/orders` },
      note: 'Nothing is charged online at checkout. Settlement instructions are sent separately for your selected payment method.',
      footerNote: 'For research use only. Not for human or veterinary consumption.',
    }),
  };
}

export function orderAdminEmail(options: {
  customerName?: string;
  customerEmail: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
}) {
  const amount = formatMoney(options.totalAmount, options.currency);
  const base = siteUrl();

  return {
    subject: `[Order] ${options.orderNumber} — ${options.customerEmail}`,
    html: brandedHtml({
      preheader: `New checkout order ${options.orderNumber} from ${options.customerEmail}`,
      eyebrow: 'New order',
      title: 'New order placed',
      intro: 'A customer completed checkout on the MCPFAC BIOTECH storefront.',
      details: [
        { label: 'Order number', value: options.orderNumber },
        { label: 'Customer', value: options.customerName || '—' },
        { label: 'Email', value: options.customerEmail },
        { label: 'Order total', value: amount },
      ],
      cta: { label: 'Open admin orders', href: `${base}/admin/orders` },
      note: 'Follow up with payment settlement instructions and prepare fulfilment once payment is confirmed.',
      footerNote: 'Internal notification — reply to the customer at the email above.',
    }),
  };
}

const ORDER_STATUS_COPY: Record<
  string,
  { title: string; intro: string; eyebrow: string }
> = {
  PENDING: {
    eyebrow: 'Order update',
    title: 'Your order is pending',
    intro: 'Your order is awaiting confirmation. We will email you when it moves to the next step.',
  },
  CONFIRMED: {
    eyebrow: 'Order confirmed',
    title: 'Your order is confirmed',
    intro: 'We confirmed your order and will begin fulfilment preparation shortly.',
  },
  PROCESSING: {
    eyebrow: 'Order update',
    title: 'Your order is being processed',
    intro: 'Our team is preparing your research materials for packing.',
  },
  PACKED: {
    eyebrow: 'Order update',
    title: 'Your order is packed',
    intro: 'Your order has been packed and is ready for dispatch.',
  },
  SHIPPED: {
    eyebrow: 'Order shipped',
    title: 'Your order is on the way',
    intro: 'Your order has shipped. Tracking details will follow when available from the carrier.',
  },
  DELIVERED: {
    eyebrow: 'Order delivered',
    title: 'Your order was delivered',
    intro: 'Your order is marked as delivered. Contact support if anything is missing or damaged.',
  },
  CANCELLED: {
    eyebrow: 'Order cancelled',
    title: 'Your order was cancelled',
    intro: 'This order has been cancelled. Reply to this email if you need help placing a new order.',
  },
  RETURNED: {
    eyebrow: 'Order update',
    title: 'Your order return was recorded',
    intro: 'We recorded a return for this order. Our team may follow up with next steps.',
  },
};

export function orderStatusUpdateEmail(options: {
  customerName?: string;
  orderNumber: string;
  fromStatus?: string;
  toStatus: string;
  note?: string;
}) {
  const base = siteUrl();
  const copy =
    ORDER_STATUS_COPY[options.toStatus] ??
    ({
      eyebrow: 'Order update',
      title: `Order status: ${options.toStatus}`,
      intro: `Your order status was updated to ${options.toStatus}.`,
    } as const);

  const details: DetailRow[] = [
    { label: 'Order number', value: options.orderNumber },
    { label: 'New status', value: options.toStatus },
  ];

  if (options.fromStatus) {
    details.splice(1, 0, { label: 'Previous status', value: options.fromStatus });
  }

  return {
    subject: `Order ${options.orderNumber} is now ${options.toStatus} — MCPFAC BIOTECH`,
    html: brandedHtml({
      preheader: `Order ${options.orderNumber} status: ${options.toStatus}`,
      eyebrow: copy.eyebrow,
      title: copy.title,
      greeting: options.customerName ? `Hello ${options.customerName},` : 'Hello,',
      intro: copy.intro,
      details,
      bodyHtml: options.note
        ? `
        <div style="margin:8px 0 0;padding:16px 18px;border-left:3px solid ${BRAND.leaf};background:${BRAND.surface};border-radius:0 10px 10px 0;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">Update note</p>
          <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.ink};white-space:pre-wrap;">${escapeHtml(options.note)}</p>
        </div>`
        : undefined,
      cta: { label: 'View your order', href: `${base}/orders` },
      note: 'For research use only. Contact support if you have questions about this update.',
      footerNote: 'For research use only. Not for human or veterinary consumption.',
    }),
  };
}

export function quoteSubmittedEmail(options: {
  customerName?: string;
  quoteNumber: string;
  totalAmount: number;
  currency: string;
}) {
  const amount = formatMoney(options.totalAmount, options.currency);
  const base = siteUrl();

  return {
    subject: `Quote received ${options.quoteNumber} — MCPFAC BIOTECH`,
    html: brandedHtml({
      preheader: `Quote ${options.quoteNumber} received. Estimated total ${amount}.`,
      eyebrow: 'Quotation request',
      title: 'We received your quote request',
      greeting: options.customerName ? `Hello ${options.customerName},` : 'Hello,',
      intro:
        'Our sales team is reviewing your quotation request and will respond with pricing and availability shortly.',
      details: [
        { label: 'Quote number', value: options.quoteNumber },
        { label: 'Estimated total', value: amount },
      ],
      cta: { label: 'View your quotes', href: `${base}/quotes` },
      note: 'Estimated totals may change after review of quantities, documentation, and destination requirements.',
      footerNote: 'For research use only. Not for human or veterinary consumption.',
    }),
  };
}

export function quoteAdminEmail(options: {
  customerName?: string;
  customerEmail: string;
  quoteNumber: string;
  totalAmount: number;
  currency: string;
}) {
  const amount = formatMoney(options.totalAmount, options.currency);
  const base = siteUrl();

  return {
    subject: `[Quote] ${options.quoteNumber} — ${options.customerEmail}`,
    html: brandedHtml({
      preheader: `New quote ${options.quoteNumber} from ${options.customerEmail}`,
      eyebrow: 'New quote request',
      title: 'New quotation request',
      intro: 'A customer submitted a quotation request from the storefront.',
      details: [
        { label: 'Quote number', value: options.quoteNumber },
        { label: 'Customer', value: options.customerName || '—' },
        { label: 'Email', value: options.customerEmail },
        { label: 'Estimated total', value: amount },
      ],
      cta: { label: 'Open admin quotes', href: `${base}/admin/quotes` },
      note: 'Review quantities, documentation needs, and destination before confirming pricing.',
      footerNote: 'Internal notification — reply to the customer at the email above.',
    }),
  };
}

export function contactMessageEmail(options: {
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
}) {
  const details: DetailRow[] = [
    { label: 'From', value: `${options.name} <${options.email}>` },
    { label: 'Subject', value: options.subject },
  ];

  if (options.organization) {
    details.splice(1, 0, { label: 'Organization', value: options.organization });
  }

  return {
    subject: `[Contact] ${options.subject}`,
    html: brandedHtml({
      preheader: `New contact message from ${options.name}`,
      eyebrow: 'Inbound inquiry',
      title: 'New contact form message',
      intro: 'A visitor submitted a message through the MCPFAC BIOTECH website.',
      details,
      bodyHtml: `
        <div style="margin:8px 0 0;padding:16px 18px;border-left:3px solid ${BRAND.leaf};background:${BRAND.surface};border-radius:0 10px 10px 0;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">Message</p>
          <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.ink};white-space:pre-wrap;">${escapeHtml(options.message)}</p>
        </div>
      `,
      footerNote: 'Reply directly to the sender using the reply-to address on this email.',
    }),
  };
}

export function contactAckEmail(options: {
  name: string;
  email: string;
  subject: string;
}) {
  const base = siteUrl();

  return {
    subject: `We received your message — MCPFAC BIOTECH`,
    html: brandedHtml({
      preheader: `Thanks ${options.name}, we received your inquiry.`,
      eyebrow: 'Message received',
      title: 'Thank you for contacting us',
      greeting: `Hello ${options.name},`,
      intro:
        'We received your message and our team will respond as soon as possible during business hours (Mon–Fri, China Standard Time).',
      details: [
        { label: 'Your email', value: options.email },
        { label: 'Subject', value: options.subject },
      ],
      cta: { label: 'Visit support center', href: `${base}/support` },
      note: 'If your request is urgent, reply to this email or write directly to info@mcpfacbiotech.site.',
      footerNote: 'For research use only. Not for human or veterinary consumption.',
    }),
  };
}

export function newsletterWelcomeEmail(options: { email: string }) {
  const base = siteUrl();

  return {
    subject: 'You are subscribed — MCPFAC BIOTECH research updates',
    html: brandedHtml({
      preheader: 'Thanks for subscribing to MCPFAC BIOTECH research updates.',
      eyebrow: 'Newsletter',
      title: 'You are on the list',
      greeting: 'Hello,',
      intro:
        'Thanks for subscribing. We will share new catalog releases, research briefs, and documentation updates for laboratory buyers.',
      details: [{ label: 'Subscribed as', value: options.email }],
      cta: { label: 'Browse research catalog', href: `${base}/products` },
      note: 'You can reply to this email if you need to update your subscription preferences.',
      footerNote: 'For research use only. Not for human or veterinary consumption.',
    }),
  };
}

export function newsletterAdminEmail(options: { email: string }) {
  return {
    subject: `[Newsletter] New subscriber — ${options.email}`,
    html: brandedHtml({
      preheader: `New newsletter subscriber: ${options.email}`,
      eyebrow: 'Newsletter',
      title: 'New newsletter subscriber',
      intro: 'Someone subscribed via the website footer form.',
      details: [
        { label: 'Email', value: options.email },
        { label: 'Source', value: 'Website footer' },
      ],
      footerNote: 'Store this address in your newsletter audience until a CRM integration is live.',
    }),
  };
}

