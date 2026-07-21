'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Input, Label, Textarea } from '@/components/ui';
import { submitContactMessage } from '@/lib/contact-api';

export function ContactForm() {
  const searchParams = useSearchParams();
  const defaultSubject = searchParams.get('subject') ?? '';
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await submitContactMessage({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        organization: String(formData.get('organization') ?? '') || undefined,
        subject: String(formData.get('subject') ?? ''),
        message: String(formData.get('message') ?? ''),
      });
      setSubmitted(true);
    } catch {
      setError('Unable to send your message right now. Please email info@mcpfacbiotech.site directly.');
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="border-l-2 border-brand-leaf bg-brand-pale/40 px-5 py-6 sm:px-6">
        <h3 className="font-heading text-lg font-semibold text-brand-deep">Message received</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Thank you for contacting MCPFAC BIOTECH. Our team will respond to your inquiry shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-t border-neutral-200 pt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" isRequired>
            Full name
          </Label>
          <Input id="name" name="name" required placeholder="Dr. Jane Smith" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" isRequired>
            Email
          </Label>
          <Input id="email" name="email" type="email" required placeholder="jane@lab.edu" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <Input id="organization" name="organization" placeholder="University / Laboratory" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject" isRequired>
          Subject
        </Label>
        <Input
          id="subject"
          name="subject"
          required
          defaultValue={defaultSubject}
          placeholder="Product inquiry, quotation, support…"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" isRequired>
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Include SKUs, quantities, destination, or COA batch numbers where relevant."
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" isLoading={pending}>
        Send message
      </Button>
    </form>
  );
}
