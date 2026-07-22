import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { BlogService } from './blog.service';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published blog posts' })
  async list() {
    const data = await this.blogService.listPublished();
    return { message: 'Blog posts retrieved', data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  async getBySlug(@Param('slug') slug: string) {
    const data = await this.blogService.getPublishedBySlug(slug);
    return { message: 'Blog post retrieved', data };
  }
}
