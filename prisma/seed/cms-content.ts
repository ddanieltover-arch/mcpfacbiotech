import type { PrismaClient } from '@prisma/client';
import { BlogPostStatus } from '@prisma/client';

type SeedSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  sections: SeedSection[];
};

const BLOG_SEED: SeedPost[] = [
  {
    slug: 'coa-first-procurement',
    title: 'Why COA-first procurement matters for research labs',
    excerpt:
      'How lot documentation, HPLC context, and receiving checklists reduce back-and-forth before experiments start.',
    category: 'Documentation',
    publishedAt: '2026-07-01',
    readingTime: '5 min',
    sections: [
      {
        heading: 'The problem with vague certificates',
        paragraphs: [
          'Institutional buyers often stall orders when certificates arrive late, lack lot numbers, or cannot be matched to the vials on the bench. A COA-first catalog reduces that friction by linking documentation to SKUs before checkout.',
          'MCPFAC BIOTECH surfaces Certificates of Analysis, MSDS, and HPLC reports on product pages where published, with a dedicated COA library for batch lookup when files need to be requested.',
        ],
      },
      {
        heading: 'A practical receiving checklist',
        paragraphs: ['Before locking a protocol to a lot, confirm:'],
        bullets: [
          'Batch / lot number on the vial matches the COA',
          'Purity and identity methods are stated (e.g. HPLC, LC–MS when on file)',
          'Storage guidance is recorded in the lab notebook',
          'MSDS is accessible to the group handling the material',
        ],
      },
      {
        heading: 'Next steps',
        paragraphs: [
          'Browse the COA library for batch requests, or open any product page documentation section. Pair this with Quality Assurance notes for purity expectations.',
        ],
      },
    ],
  },
  {
    slug: 'shipping-tiers-explained',
    title: 'Shipping tiers explained: Standard vs Priority Express',
    excerpt:
      'What checkout rates cover, how dispatch windows work, and when Priority Express is worth selecting.',
    category: 'Logistics',
    publishedAt: '2026-07-08',
    readingTime: '4 min',
    sections: [
      {
        heading: 'Rates that match checkout',
        paragraphs: [
          'MCPFAC BIOTECH checkout offers two flat shipping methods: Standard Delivery (3–5 business days, $25) and Priority Express (1–2 business days, $50). Cart totals use the same figures shown on the Shipping Information page — no surprise carrier markup at payment time.',
        ],
      },
      {
        heading: 'Dispatch vs transit',
        paragraphs: [
          'Most in-stock orders enter preparation within a 24–48 hour window on business days when inventory allows. Priority Express shortens transit after dispatch; it does not replace stock verification or documentation review before shipment.',
        ],
      },
      {
        heading: 'Packaging notes',
        paragraphs: [
          'Lyophilized and temperature-sensitive materials ship in protective packaging. Follow product-page handling notes on receipt, and contact support within 7 days if a shipment arrives damaged or incorrect.',
        ],
      },
    ],
  },
  {
    slug: 'research-use-only-reminder',
    title: 'Research-use only: framing procurement for compliance teams',
    excerpt:
      'Clear language for buyers, IBC packages, and receiving docks — what “laboratory use only” means on this storefront.',
    category: 'Compliance',
    publishedAt: '2026-07-15',
    readingTime: '4 min',
    sections: [
      {
        heading: 'What we mean by research use',
        paragraphs: [
          'All MCPFAC BIOTECH catalog products are intended for laboratory research and development. They are not for human or animal consumption, diagnosis, or therapy. Buyers assume regulatory responsibility in their jurisdiction.',
        ],
      },
      {
        heading: 'Helpful language for internal packets',
        paragraphs: [
          'When preparing purchase requests or IBC submissions, cite product specifications, lot COAs where published, and the research-use disclaimer on product and checkout surfaces. Educational research briefs in our library are literature-oriented notes — not clinical guidance.',
        ],
        bullets: [
          'Not for human or animal consumption',
          'For laboratory and R&D use only',
          'Verify lot documentation before experimental use',
        ],
      },
      {
        heading: 'Where to go next',
        paragraphs: [
          'Read FAQ for common procurement questions, browse the research library for peptide briefs, or contact support for institutional quotation workflows.',
        ],
      },
    ],
  },
];

const FAQ_SEED: Array<{ question: string; answer: string }> = [
  {
    question: 'Are your products for human consumption?',
    answer:
      'No. All products listed are strictly for laboratory research and development purposes only. They are not intended for human or animal consumption, diagnosis, or therapy.',
  },
  {
    question: 'What purity should I expect?',
    answer:
      'We target ≥99% for lyophilized peptides where batch COAs are published. Identity and purity are documented via third-party HPLC and mass spectrometry when available — always verify against your batch record on the product page or Downloads Center.',
  },
  {
    question: 'Do you provide batch documentation (COA / MSDS / HPLC)?',
    answer:
      'Yes. Where published, Certificates of Analysis, MSDS, and HPLC reports are linked from product pages and the Downloads Center. Contact support with your SKU and batch number if a file is missing.',
  },
  {
    question: 'What are your shipping timelines and rates?',
    answer:
      'Most in-stock orders are prepared within 24–48 hours on business days when inventory allows. Checkout offers Standard Delivery (3–5 business days, $25) and Priority Express (1–2 business days, $50). See the Shipping Information page for packaging and customs notes.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Checkout supports manual payment rails: Bitcoin, USDT, credit card, bank transfer, Chime, and Cash App. Settlement instructions are emailed after you place an order. Institutional buyers may also discuss purchase-order workflows with our team.',
  },
  {
    question: 'How do I verify the purity of my order?',
    answer:
      'Each shipment should be cross-checked against the lot documentation published for that SKU. Compare your batch reference with the COA / HPLC packet in Downloads or on the product page, or ask support for the analytical packet tied to your lot.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'Opened research materials generally cannot be restocked. If your order arrives damaged or incorrect, contact us within 7 days with your order number and photos so we can correct it. See the Return Policy page for full guidelines.',
  },
  {
    question: 'Can I request a quotation for wholesale or institutional orders?',
    answer:
      'Yes. Add products to your cart and submit a quote request, or contact us with SKUs, quantities, and delivery location. Institutional and distributor pricing is available based on volume and customer group.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes. We ship to research facilities worldwide. Customers are responsible for ensuring products are permitted for import into their jurisdiction for research use. Destination restrictions and customs notes are summarized on the Shipping Information page.',
  },
  {
    question: 'How do I track an order?',
    answer:
      'Once your order ships, tracking details appear in your account under Orders. You can also contact support with your order number.',
  },
  {
    question: 'Where can I learn more about quality standards?',
    answer:
      'See the Quality Assurance page for our COA-first workflow, HPLC / identity expectations, and packaging practices. Product pages list specifications for each SKU.',
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function seedCmsContent(prisma: PrismaClient): Promise<void> {
  for (const post of BLOG_SEED) {
    const categorySlug = slugify(post.category);
    const category = await prisma.blogCategory.upsert({
      where: { slug: categorySlug },
      create: { name: post.category, slug: categorySlug },
      update: { name: post.category },
    });

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: JSON.stringify({
          readingTime: post.readingTime,
          sections: post.sections,
        }),
        authorName: 'MCPFAC BIOTECH',
        status: BlogPostStatus.PUBLISHED,
        publishedAt: new Date(post.publishedAt),
        isFeatured: post.slug === 'coa-first-procurement',
        categoryId: category.id,
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: JSON.stringify({
          readingTime: post.readingTime,
          sections: post.sections,
        }),
        status: BlogPostStatus.PUBLISHED,
        publishedAt: new Date(post.publishedAt),
        categoryId: category.id,
        deletedAt: null,
      },
    });
  }

  let faqCategory = await prisma.faqCategory.findFirst({
    where: { name: 'General' },
  });
  if (!faqCategory) {
    faqCategory = await prisma.faqCategory.create({
      data: {
        name: 'General',
        sortOrder: 0,
        isVisible: true,
      },
    });
  } else {
    faqCategory = await prisma.faqCategory.update({
      where: { id: faqCategory.id },
      data: { sortOrder: 0, isVisible: true },
    });
  }

  const existingCount = await prisma.faqQuestion.count({
    where: { categoryId: faqCategory.id },
  });
  if (existingCount === 0) {
    await prisma.faqQuestion.createMany({
      data: FAQ_SEED.map((item, index) => ({
        categoryId: faqCategory.id,
        question: item.question,
        answer: item.answer,
        sortOrder: index,
        isVisible: true,
      })),
    });
  }
}
