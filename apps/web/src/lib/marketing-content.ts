/**
 * M8 Content map — marketing copy adapted for MCPFAC BIOTECH.
 * Structure inspired by reference storefronts; text is original / rebranded.
 */

export const PROMO_BAR_ITEMS = [
  { icon: 'truck' as const, label: 'Global laboratory shipping' },
  { icon: 'check' as const, label: '99%+ purity target where published' },
  { icon: 'file' as const, label: 'COA-backed documentation' },
] as const;

export const TRUST_STATS = [
  { value: '99%+', label: 'Purity grade target' },
  { value: '24–48h', label: 'Typical dispatch window' },
  { value: 'COA', label: 'Batch documentation' },
  { value: 'R&D', label: 'Research use only' },
] as const;

export const CATEGORY_HUBS = [
  {
    title: 'Research peptides',
    description:
      'Synthetic sequences for signalling, metabolic, and regenerative models in controlled lab settings.',
    href: '/products?category=research-peptides',
    examples: 'BPC-157, TB-500, GHK-Cu, MOTS-c (examples)',
  },
  {
    title: 'Growth & recovery compounds',
    description:
      'GH-secretagogue peptides and related tools used in endocrine and recovery-oriented preclinical designs.',
    href: '/products?category=research-chemicals',
    examples: 'IGF-1 LR3, CJC-1295, ipamorelin (examples)',
  },
  {
    title: 'Specialty research compounds',
    description:
      'Small molecules and niche co-factors often paired with mitochondrial or redox readouts.',
    href: '/products?category=analytical-standards',
    examples: 'NAD+, glutathione, specialty standards (examples)',
  },
  {
    title: 'Laboratory supplies',
    description: 'Consumables and workflow materials that support reconstitution, storage, and assay prep.',
    href: '/products?category=laboratory-supplies',
    examples: 'BAC water, vials, lab essentials (examples)',
  },
] as const;

export const WHY_US_FEATURES = [
  {
    title: 'Third-party oriented testing',
    description:
      'Where published, identity and purity are documented via HPLC and related methods suitable for laboratory procurement.',
  },
  {
    title: '99%+ purity target',
    description:
      'We present clear specifications on product pages and reject ambiguous or undocumented listings from the live catalog.',
  },
  {
    title: 'COA-forward catalog',
    description:
      'Certificates of Analysis, MSDS, and HPLC reports are linked where available — verify lot records before experimental use.',
  },
  {
    title: 'Research logistics',
    description:
      'Standard and priority shipping options at checkout, with packaging chosen to protect lyophilized and documented materials.',
  },
] as const;

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Browse catalog',
    description: 'Explore peptides, chemicals, and supplies with transparent specifications.',
  },
  {
    step: '02',
    title: 'Secure checkout',
    description: 'Select shipping and manual payment method; stock is validated at order time.',
  },
  {
    step: '03',
    title: 'Quality review',
    description: 'Orders are prepared with documentation checks before dispatch.',
  },
  {
    step: '04',
    title: 'Tracked fulfilment',
    description: 'Receive tracking and invoice records for institutional receiving.',
  },
] as const;

export const COMPARISON_ROWS = [
  { metric: 'Purity threshold', mcpfac: '99%+ target where published', industry: '95% – 98% typical' },
  { metric: 'Batch documentation', mcpfac: 'COA linked when available', industry: 'Upon request only' },
  { metric: 'Catalog transparency', mcpfac: 'Specs on every product page', industry: 'Partial listings' },
  { metric: 'Dispatch window', mcpfac: 'Typically 24–48h when stock allows', industry: '3 – 5 business days' },
  { metric: 'Shipping options', mcpfac: 'Standard & priority at checkout', industry: 'Single flat rate' },
  { metric: 'Use case framing', mcpfac: 'Research / laboratory only', industry: 'Mixed messaging' },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      'Clear specifications and documentation links made procurement straightforward for our core facility workflows.',
    author: 'Research procurement lead',
    role: 'University laboratory (illustrative)',
  },
  {
    quote:
      'Having COA and HPLC references attached to SKUs reduced back-and-forth before we placed institutional orders.',
    author: 'Staff scientist',
    role: 'Analytical chemistry group (illustrative)',
  },
  {
    quote:
      'Checkout with explicit shipping tiers and payment method selection fits how our admin team settles research purchases.',
    author: 'Lab operations coordinator',
    role: 'Biotech R&D team (illustrative)',
  },
] as const;

export const RESEARCH_USE_DISCLAIMER =
  'Products are intended for laboratory research and development use only. Not for human or animal consumption, diagnosis, or therapy. Buyers assume regulatory responsibility in their jurisdiction.';

export const HOME_HERO = {
  eyebrow: 'Research catalog for laboratories worldwide',
  title: 'Purity defined.',
  titleAccent: 'Science elevated.',
  description:
    'MCPFAC BIOTECH supplies research peptides, chemicals, and laboratory materials with transparent specifications, COA-backed documentation where published, and reliable fulfilment for institutional buyers.',
  primaryCta: { href: '/products', label: 'Explore catalog' },
  secondaryCta: { href: '/coa', label: 'COA library' },
} as const;

/** Full FAQ catalog — homepage teaser uses the first four entries. */
export const FAQ_ITEMS = [
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
] as const;

export const HOME_FAQ_TEASER = FAQ_ITEMS.slice(0, 4);

export const QUALITY_PILLARS = [
  {
    title: 'HPLC release mindset',
    description:
      'Where published, purity is framed around chromatographic primary-peak performance suitable for laboratory procurement decisions.',
  },
  {
    title: 'Orthogonal identity',
    description:
      'Mass spectrometry and related identity confirmation are referenced on lot documentation when included in the analytical packet.',
  },
  {
    title: 'COA-first catalog',
    description:
      'Certificates of Analysis, MSDS, and HPLC reports are linked from product pages and the Downloads Center when available for that SKU.',
  },
  {
    title: 'Storage & handling clarity',
    description:
      'Lyophilized and temperature-sensitive materials include storage guidance so receiving labs can maintain chain-of-custody integrity.',
  },
] as const;

export const SHIPPING_EXPECTATIONS = [
  'Order confirmation by email after checkout or quote conversion',
  'Preparation within a typical 24–48 hour window when stock allows',
  'Carrier tracking once the shipment is dispatched',
  'Commercial invoice and packing details for customs where required',
] as const;

export const CONTACT_CHANNELS = {
  email: 'info@mcpfacbiotech.site',
  address: 'No. 9 Tangkeng Road, Longgang District, Shenzhen, Guangdong 518115, China',
  hours: 'Mon–Fri 9:00–18:00 CST (China Standard Time)',
  response: 'Most inquiries receive a reply within one business day',
} as const;

export const CONTACT_HERO = {
  eyebrow: 'Support & sales',
  title: 'Contact MCPFAC BIOTECH',
  description:
    'Product specifications, bulk quotations, documentation requests, shipping questions, and laboratory support — our team responds within one business day.',
} as const;

export const CONTACT_QUICK_PATHS = [
  {
    href: '/contact?subject=Bulk%20%2F%20institutional%20quotation',
    title: 'Bulk / institutional quote',
    description: 'Share SKUs, quantities, and destination',
  },
  {
    href: '/coa',
    title: 'COA / batch docs',
    description: 'Library and batch lookup tools',
  },
  {
    href: '/shipping',
    title: 'Shipping & logistics',
    description: 'Rates, dispatch windows, and customs',
  },
] as const;

export const CAREERS_HERO = {
  eyebrow: 'Join the team',
  title: 'Build with MCPFAC BIOTECH',
  description:
    'Join a biotechnology team focused on research quality, global supply, and scientific service for laboratories worldwide.',
} as const;

export const CAREERS_ROLE_FAMILIES = [
  {
    title: 'Operations & fulfilment',
    description: 'Order preparation, inventory coordination, and reliable dispatch for research buyers.',
  },
  {
    title: 'Laboratory support',
    description: 'Documentation, quality context, and technical support for catalog materials.',
  },
  {
    title: 'Customer success',
    description: 'Quotations, institutional accounts, and day-to-day procurement assistance.',
  },
  {
    title: 'Digital product',
    description: 'Storefront, catalog, and platform experiences that serve laboratory procurement.',
  },
] as const;

export const CAREERS_APPLY_STEPS = [
  'Email your CV and a short introduction to info@mcpfacbiotech.site',
  'Include the role family you are interested in',
  'Tell us about relevant laboratory, commerce, or operations experience',
] as const;

export const ABOUT_HIGHLIGHTS = [
  { value: '2016', label: 'Established' },
  { value: '50+', label: 'Countries served' },
  { value: 'COA', label: 'Documentation-first' },
  { value: 'R&D', label: 'Research use only' },
] as const;

export const ABOUT_OFFERINGS = [
  {
    title: 'Research peptides & chemicals',
    description: 'Laboratory-grade materials with transparent specifications on every catalog listing.',
  },
  {
    title: 'Analytical standards & supplies',
    description: 'Supporting materials for method development, calibration, and day-to-day lab workflows.',
  },
  {
    title: 'Batch documentation',
    description: 'COA, MSDS, and HPLC records linked where published — verify lots before experimental use.',
  },
  {
    title: 'Institutional procurement',
    description: 'Quotation support, wholesale pricing, and fulfilment options built for research buyers.',
  },
] as const;

export const ABOUT_HERO = {
  eyebrow: 'Established 2016 · Shenzhen, China',
  title: 'MCPFAC BIOTECH',
  subtitle: 'Learn · Understand · Grow',
  description:
    'A biotechnology research laboratory and global supplier dedicated to scientific quality, transparent documentation, and reliable delivery to research facilities worldwide.',
} as const;

/** Local Unsplash-sourced hero imagery for the About page. */
export const ABOUT_IMAGES = {
  hero: {
    src: '/images/about/hero-lab.jpg',
    alt: 'Laboratory glassware and research flasks on a lab bench',
  },
} as const;

export const SOLUTIONS_NAV = [
  {
    href: '/solutions/universities',
    short: 'Universities',
    title: 'For Universities',
    description: 'Catalog access, quotations, and documentation for academic procurement teams.',
    highlights: [
      'Browse research peptides, chemicals, and analytical standards online',
      'Request multi-line quotations for lab groups and shared facilities',
      'Access COA / MSDS downloads where available',
      'Centralize order history and invoices in one customer portal',
    ],
    cta: { href: '/register', label: 'Create an institutional account' },
  },
  {
    href: '/solutions/research-labs',
    short: 'Research Labs',
    title: 'For Research Labs',
    description: 'Reliable supply of research peptides, chemicals, and analytical standards.',
    highlights: [
      'Fast product discovery with search and category filters',
      'Wishlist and compare tools for planning experiments',
      'Cart-based quotation requests for upcoming studies',
      'Shipping visibility once orders are dispatched',
    ],
    cta: { href: '/products', label: 'Browse the catalog' },
  },
  {
    href: '/solutions/pharmaceutical',
    short: 'Pharma',
    title: 'For Pharma Companies',
    description: 'Specification-led sourcing with invoice and compliance-friendly workflows.',
    highlights: [
      'Transparent product specifications for R&D evaluation',
      'Invoice and account records suitable for internal procurement',
      'Dedicated support for recurring research supply needs',
      'Quality-focused packaging and shipment handling',
    ],
    cta: { href: '/contact', label: 'Request a consultation' },
  },
  {
    href: '/solutions/distributors',
    short: 'Distributors',
    title: 'For Distributors',
    description: 'Wholesale-ready quotations and partner support for regional laboratory supply.',
    highlights: [
      'Volume-oriented quotation workflows',
      'Access to research peptides, chemicals, standards, and supplies',
      'Sales support for destination and documentation questions',
      'Account tools for repeating wholesale orders',
    ],
    cta: { href: '/contact', label: 'Become a partner' },
  },
] as const;
