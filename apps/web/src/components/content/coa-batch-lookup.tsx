'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@/components/ui';

/**
 * Batch COA lookup stub — until CMS/document search is live,
 * submits via mailto to support with SKU + batch context.
 */
export function CoaBatchLookup() {
  const [sku, setSku] = useState('');
  const [batch, setBatch] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(
      `COA request — ${sku.trim() || 'SKU TBD'}${batch.trim() ? ` / batch ${batch.trim()}` : ''}`,
    );
    const body = encodeURIComponent(
      [
        'Please send the Certificate of Analysis (and HPLC if available) for:',
        '',
        `SKU / product: ${sku.trim() || '(not provided)'}`,
        `Batch / lot: ${batch.trim() || '(not provided)'}`,
        `Reply email: ${email.trim() || '(not provided)'}`,
        '',
        'Organization / lab:',
        'Notes:',
      ].join('\n'),
    );
    window.location.href = `mailto:info@mcpfacbiotech.cn?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200/80 sm:p-7"
    >
      <div>
        <p className="font-heading text-lg font-semibold text-brand-deep">Request form</p>
        <p className="mt-1 text-sm text-neutral-500">
          Opens your email client to info@mcpfacbiotech.cn
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="coa-sku" isRequired>
          Product SKU or name
        </Label>
        <Input
          id="coa-sku"
          name="sku"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="e.g. BPC-157 or SKU-…"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coa-batch">Batch / lot number</Label>
        <Input
          id="coa-batch"
          name="batch"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          placeholder="From vial label or packing slip"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coa-email">Your email</Label>
        <Input
          id="coa-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@lab.org"
        />
      </div>
      <Button type="submit" fullWidth>
        Request COA packet
      </Button>
      <p className="text-xs leading-relaxed text-neutral-500">
        For published lots, check the product page documentation section first.
      </p>
    </form>
  );
}
