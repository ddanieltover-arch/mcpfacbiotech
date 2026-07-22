import { Injectable } from '@nestjs/common';
import type { FaqCategoryPublic, FaqItem } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(): Promise<FaqItem[]> {
    const rows = await this.prisma.faqQuestion.findMany({
      where: {
        isVisible: true,
        category: { isVisible: true },
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        question: true,
        answer: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
    }));
  }

  async listByCategory(): Promise<FaqCategoryPublic[]> {
    const categories = await this.prisma.faqCategory.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        questions: {
          where: { isVisible: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    return categories
      .filter((category) => category.questions.length > 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        questions: category.questions.map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
        })),
      }));
  }
}
