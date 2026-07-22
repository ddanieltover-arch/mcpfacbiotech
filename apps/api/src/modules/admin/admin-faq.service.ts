import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminFaqCategory, AdminFaqQuestion } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import type { AdminFaqQueryDto } from './dto/admin-query.dto';
import type {
  CreateAdminFaqCategoryDto,
  CreateAdminFaqQuestionDto,
  UpdateAdminFaqCategoryDto,
  UpdateAdminFaqQuestionDto,
} from './dto/admin-mutations.dto';

@Injectable()
export class AdminFaqService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(): Promise<AdminFaqCategory[]> {
    const rows = await this.prisma.faqCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { questions: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      sortOrder: row.sortOrder,
      isVisible: row.isVisible,
      questionCount: row._count.questions,
    }));
  }

  async createCategory(dto: CreateAdminFaqCategoryDto): Promise<AdminFaqCategory> {
    const created = await this.prisma.faqCategory.create({
      data: {
        name: dto.name.trim(),
        sortOrder: dto.sortOrder ?? 0,
        isVisible: dto.isVisible ?? true,
      },
      include: { _count: { select: { questions: true } } },
    });
    return {
      id: created.id,
      name: created.name,
      sortOrder: created.sortOrder,
      isVisible: created.isVisible,
      questionCount: created._count.questions,
    };
  }

  async updateCategory(id: string, dto: UpdateAdminFaqCategoryDto): Promise<AdminFaqCategory> {
    await this.requireCategory(id);
    const updated = await this.prisma.faqCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
      },
      include: { _count: { select: { questions: true } } },
    });
    return {
      id: updated.id,
      name: updated.name,
      sortOrder: updated.sortOrder,
      isVisible: updated.isVisible,
      questionCount: updated._count.questions,
    };
  }

  async deleteCategory(id: string): Promise<void> {
    await this.requireCategory(id);
    await this.prisma.faqCategory.delete({ where: { id } });
  }

  async listQuestions(query: AdminFaqQueryDto) {
    const where: Prisma.FaqQuestionWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.visible === 'true' ? { isVisible: true } : {}),
      ...(query.visible === 'false' ? { isVisible: false } : {}),
      ...(query.search
        ? {
            OR: [
              { question: { contains: query.search, mode: 'insensitive' } },
              { answer: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.faqQuestion.findMany({
        where,
        include: { category: true },
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.faqQuestion.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toQuestion(row)),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async createQuestion(dto: CreateAdminFaqQuestionDto): Promise<AdminFaqQuestion> {
    await this.requireCategory(dto.categoryId);
    const created = await this.prisma.faqQuestion.create({
      data: {
        categoryId: dto.categoryId,
        question: dto.question.trim(),
        answer: dto.answer.trim(),
        sortOrder: dto.sortOrder ?? 0,
        isVisible: dto.isVisible ?? true,
      },
      include: { category: true },
    });
    return this.toQuestion(created);
  }

  async updateQuestion(id: string, dto: UpdateAdminFaqQuestionDto): Promise<AdminFaqQuestion> {
    await this.requireQuestion(id);
    if (dto.categoryId) await this.requireCategory(dto.categoryId);

    const updated = await this.prisma.faqQuestion.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.question !== undefined ? { question: dto.question.trim() } : {}),
        ...(dto.answer !== undefined ? { answer: dto.answer.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
      },
      include: { category: true },
    });
    return this.toQuestion(updated);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.requireQuestion(id);
    await this.prisma.faqQuestion.delete({ where: { id } });
  }

  private async requireCategory(id: string) {
    const existing = await this.prisma.faqCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FAQ category not found');
  }

  private async requireQuestion(id: string) {
    const existing = await this.prisma.faqQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FAQ question not found');
  }

  private toQuestion(row: {
    id: string;
    categoryId: string;
    question: string;
    answer: string;
    sortOrder: number;
    isVisible: boolean;
    updatedAt: Date;
    category: { name: string };
  }): AdminFaqQuestion {
    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.category.name,
      question: row.question,
      answer: row.answer,
      sortOrder: row.sortOrder,
      isVisible: row.isVisible,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
