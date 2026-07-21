'use client';

import { motion } from 'framer-motion';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Skeleton,
  Spinner,
  Textarea,
} from '@/components/ui';
import {
  CategoryHubGrid,
  ComparisonTable,
  MarketingSection,
  ProcessSteps,
  PromoBar,
  ResearchUseBanner,
  StatGrid,
  TestimonialGrid,
  WhyUsGrid,
} from '@/components/marketing';
import { fadeIn, slideUp, staggerChildren } from '@/lib/motion';

export default function DesignSystemPage() {
  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
            Phase 3 · Volume 2
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-brand-deep">Design system</h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            MCPFAC BIOTECH UI primitives — brand tokens, buttons, forms, feedback, and motion. Use
            these from <code className="text-sm">@/components/ui</code> instead of one-off styles.
          </p>
        </div>
      </section>

      <motion.div
        className="mx-auto grid max-w-5xl gap-10 px-4 py-12"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={slideUp}>
          <h2 className="font-heading text-xl font-semibold text-brand-deep">Brand colors</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ['brand-deep', 'bg-brand-deep'],
              ['brand-natural', 'bg-brand-natural'],
              ['brand-leaf', 'bg-brand-leaf'],
              ['brand-light', 'bg-brand-light'],
              ['brand-pale', 'bg-brand-pale'],
            ].map(([name, cls]) => (
              <div key={name} className="overflow-hidden rounded-lg border border-neutral-200">
                <div className={`h-16 ${cls}`} />
                <p className="px-2 py-2 text-xs text-neutral-600">{name}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={slideUp}>
          <h2 className="font-heading text-xl font-semibold text-brand-deep">Buttons</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button isLoading>Loading</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </motion.section>

        <motion.section variants={slideUp}>
          <h2 className="font-heading text-xl font-semibold text-brand-deep">Forms</h2>
          <Card className="mt-4 max-w-lg">
            <CardHeader>
              <CardTitle>Sample fields</CardTitle>
              <CardDescription>Label + Input + Textarea with focus rings.</CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <Label htmlFor="ds-email" isRequired>
                  Email
                </Label>
                <Input id="ds-email" type="email" placeholder="name@lab.org" />
              </div>
              <div>
                <Label htmlFor="ds-notes">Notes</Label>
                <Textarea id="ds-notes" placeholder="Optional notes" rows={3} />
              </div>
              <Input isInvalid placeholder="Invalid field example" />
            </CardBody>
            <CardFooter>
              <Button type="button">Save</Button>
            </CardFooter>
          </Card>
        </motion.section>

        <motion.section variants={slideUp}>
          <h2 className="font-heading text-xl font-semibold text-brand-deep">Badges & feedback</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            <Alert variant="brand" title="Brand notice">
              Settlement instructions are emailed after checkout.
            </Alert>
            <Alert variant="error" title="Error">
              Something went wrong. Please try again.
            </Alert>
            <Alert variant="success">Order confirmed successfully.</Alert>
          </div>
        </motion.section>

        <motion.section variants={fadeIn}>
          <h2 className="font-heading text-xl font-semibold text-brand-deep">Loading</h2>
          <div className="mt-4 flex items-center gap-6">
            <Spinner />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-24 w-24 rounded-xl" />
          </div>
          <Separator className="my-8" />
          <p className="text-sm text-neutral-500">
            Tokens live in <code>globals.css</code> (@theme). Primitives live in{' '}
            <code>components/ui</code>. Motion helpers live in <code>lib/motion.ts</code>.
            Marketing blocks live in <code>components/marketing</code> (M8 CONTENT-0).
          </p>
        </motion.section>
      </motion.div>

      <div className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="font-heading text-2xl font-bold text-brand-deep">Marketing blocks (M8)</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Shared homepage / content sections. Copy lives in{' '}
            <code className="text-xs">lib/marketing-content.ts</code>.
          </p>
        </div>
        <PromoBar />
        <MarketingSection
          eyebrow="Trust"
          title="Stat grid"
          description="Key signals for purity, dispatch, documentation, and research use."
          tone="muted"
        >
          <StatGrid />
        </MarketingSection>
        <MarketingSection
          eyebrow="Catalog"
          title="Category hubs"
          description="Shop-by-category cards for the homepage lattice."
        >
          <CategoryHubGrid />
        </MarketingSection>
        <MarketingSection eyebrow="Trust" title="Why MCPFAC" tone="muted">
          <WhyUsGrid />
        </MarketingSection>
        <MarketingSection eyebrow="Procurement" title="Sourcing process">
          <ProcessSteps />
        </MarketingSection>
        <MarketingSection eyebrow="Standards" title="Comparison table" tone="muted">
          <ComparisonTable />
        </MarketingSection>
        <MarketingSection eyebrow="Feedback" title="Testimonials">
          <TestimonialGrid />
        </MarketingSection>
        <MarketingSection eyebrow="Compliance" title="Research-use banner" tone="brand">
          <ResearchUseBanner />
        </MarketingSection>
      </div>
    </div>
  );
}
