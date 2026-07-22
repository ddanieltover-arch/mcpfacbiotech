'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';

type GalleryImage = {
  id: string;
  url: string;
  alt?: string | null;
};

type ProductImageGalleryProps = {
  images: GalleryImage[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeId, setActiveId] = useState(images[0]?.id);
  const active = images.find((image) => image.id === activeId) ?? images[0];

  if (!active) {
    return (
      <div className="relative aspect-square overflow-hidden bg-brand-pale/25 ring-1 ring-neutral-200/80">
        <div className="flex h-full items-center justify-center text-brand-natural">
          <Beaker className="h-14 w-14" strokeWidth={1.25} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm lg:mx-0">
      <div className="group relative aspect-square overflow-hidden bg-brand-pale/25 ring-1 ring-neutral-200/80">
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          className="object-contain p-[12%] transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 100vw, 24rem"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2" role="listbox" aria-label="Product images">
          {images.map((image) => {
            const selected = image.id === active.id;
            return (
              <button
                key={image.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setActiveId(image.id)}
                className={cn(
                  'relative aspect-square overflow-hidden bg-neutral-50 ring-1 transition-[box-shadow,ring-color] duration-200',
                  selected
                    ? 'ring-2 ring-brand-deep'
                    : 'ring-neutral-200/80 hover:ring-brand-natural/50',
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt || productName}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
