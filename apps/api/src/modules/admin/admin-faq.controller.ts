import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ADMIN_CATALOG_ROLES } from './admin.constants';
import { AdminFaqService } from './admin-faq.service';
import { AdminFaqQueryDto } from './dto/admin-query.dto';
import {
  CreateAdminFaqCategoryDto,
  CreateAdminFaqQuestionDto,
  UpdateAdminFaqCategoryDto,
  UpdateAdminFaqQuestionDto,
} from './dto/admin-mutations.dto';

@ApiTags('admin-faq')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_CATALOG_ROLES)
@Controller('admin/faq')
export class AdminFaqController {
  constructor(private readonly faqService: AdminFaqService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List FAQ categories' })
  async listCategories() {
    const data = await this.faqService.listCategories();
    return { message: 'Admin FAQ categories retrieved', data };
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create FAQ category' })
  async createCategory(@Body() body: CreateAdminFaqCategoryDto) {
    const data = await this.faqService.createCategory(body);
    return { message: 'Admin FAQ category created', data };
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update FAQ category' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminFaqCategoryDto,
  ) {
    const data = await this.faqService.updateCategory(id, body);
    return { message: 'Admin FAQ category updated', data };
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete FAQ category (and questions)' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    await this.faqService.deleteCategory(id);
    return { message: 'Admin FAQ category deleted', data: null };
  }

  @Get('questions')
  @ApiOperation({ summary: 'List FAQ questions' })
  async listQuestions(@Query() query: AdminFaqQueryDto) {
    const data = await this.faqService.listQuestions(query);
    return { message: 'Admin FAQ questions retrieved', data };
  }

  @Post('questions')
  @ApiOperation({ summary: 'Create FAQ question' })
  async createQuestion(@Body() body: CreateAdminFaqQuestionDto) {
    const data = await this.faqService.createQuestion(body);
    return { message: 'Admin FAQ question created', data };
  }

  @Patch('questions/:id')
  @ApiOperation({ summary: 'Update FAQ question' })
  async updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminFaqQuestionDto,
  ) {
    const data = await this.faqService.updateQuestion(id, body);
    return { message: 'Admin FAQ question updated', data };
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Delete FAQ question' })
  async deleteQuestion(@Param('id', ParseUUIDPipe) id: string) {
    await this.faqService.deleteQuestion(id);
    return { message: 'Admin FAQ question deleted', data: null };
  }
}
