import type { PrismaClient } from '@prisma/client';

const CATEGORIES = [
  {
    slug: 'research-peptides',
    name: 'Research Peptides',
    description: 'High-purity research peptides for laboratory applications.',
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'research-chemicals',
    name: 'Research Chemicals',
    description: 'Analytical-grade research chemicals and reagents.',
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'laboratory-supplies',
    name: 'Laboratory Supplies',
    description: 'Essential consumables and equipment for modern laboratories.',
    sortOrder: 3,
    isFeatured: false,
  },
  {
    slug: 'analytical-standards',
    name: 'Analytical Standards',
    description: 'Certified reference materials and analytical standards.',
    sortOrder: 4,
    isFeatured: true,
  },
] as const;

export async function seedCategories(prisma: PrismaClient): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};

  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        isFeatured: category.isFeatured,
        isVisible: true,
      },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isFeatured: category.isFeatured,
        isVisible: true,
        deletedAt: null,
      },
    });

    ids[category.slug] = record.id;
  }

  return ids;
}
