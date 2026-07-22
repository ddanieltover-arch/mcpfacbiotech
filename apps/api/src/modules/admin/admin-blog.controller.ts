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
import { AdminBlogService } from './admin-blog.service';
import { AdminBlogQueryDto } from './dto/admin-query.dto';
import { CreateAdminBlogPostDto, UpdateAdminBlogPostDto } from './dto/admin-mutations.dto';

@ApiTags('admin-blog')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_CATALOG_ROLES)
@Controller('admin/blog')
export class AdminBlogController {
  constructor(private readonly blogService: AdminBlogService) {}

  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  async list(@Query() query: AdminBlogQueryDto) {
    const data = await this.blogService.list(query);
    return { message: 'Admin blog posts retrieved', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog post' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.blogService.getById(id);
    return { message: 'Admin blog post retrieved', data };
  }

  @Post()
  @ApiOperation({ summary: 'Create blog post' })
  async create(@Body() body: CreateAdminBlogPostDto) {
    const data = await this.blogService.create(body);
    return { message: 'Admin blog post created', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update blog post' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminBlogPostDto,
  ) {
    const data = await this.blogService.update(id, body);
    return { message: 'Admin blog post updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete blog post' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.remove(id);
    return { message: 'Admin blog post deleted', data: null };
  }
}
