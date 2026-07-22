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
import { AdminMediaService } from './admin-media.service';
import { AdminMediaQueryDto } from './dto/admin-query.dto';
import { CreateAdminMediaDto, UpdateAdminMediaDto } from './dto/admin-mutations.dto';

@ApiTags('admin-media')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_CATALOG_ROLES)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly mediaService: AdminMediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media library assets (URL registry)' })
  async list(@Query() query: AdminMediaQueryDto) {
    const data = await this.mediaService.list(query);
    return { message: 'Admin media retrieved', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media asset' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.mediaService.getById(id);
    return { message: 'Admin media retrieved', data };
  }

  @Post()
  @ApiOperation({ summary: 'Register media asset by URL' })
  async create(@Body() body: CreateAdminMediaDto) {
    const data = await this.mediaService.create(body);
    return { message: 'Admin media created', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update media asset' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminMediaDto,
  ) {
    const data = await this.mediaService.update(id, body);
    return { message: 'Admin media updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media asset record' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.mediaService.remove(id);
    return { message: 'Admin media deleted', data: null };
  }
}
