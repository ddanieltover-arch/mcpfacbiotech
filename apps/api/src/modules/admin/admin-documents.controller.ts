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
import { AdminDocumentsService } from './admin-documents.service';
import { AdminDocumentQueryDto } from './dto/admin-query.dto';
import {
  AttachAdminDocumentProductDto,
  CreateAdminDocumentDto,
  UpdateAdminDocumentDto,
} from './dto/admin-mutations.dto';

@ApiTags('admin-documents')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_CATALOG_ROLES)
@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentsService: AdminDocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents for CMS' })
  async list(@Query() query: AdminDocumentQueryDto) {
    const data = await this.documentsService.list(query);
    return { message: 'Admin documents retrieved', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document detail' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.documentsService.getById(id);
    return { message: 'Admin document retrieved', data };
  }

  @Post()
  @ApiOperation({ summary: 'Create document (URL registry)' })
  async create(@Body() body: CreateAdminDocumentDto) {
    const data = await this.documentsService.create(body);
    return { message: 'Admin document created', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminDocumentDto,
  ) {
    const data = await this.documentsService.update(id, body);
    return { message: 'Admin document updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete document' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.documentsService.softDelete(id);
    return { message: 'Admin document deleted', data: null };
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Attach document to a product' })
  async attachProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AttachAdminDocumentProductDto,
  ) {
    const data = await this.documentsService.attachProduct(id, body.productId);
    return { message: 'Document attached to product', data };
  }

  @Delete(':id/products/:productId')
  @ApiOperation({ summary: 'Detach document from a product' })
  async detachProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const data = await this.documentsService.detachProduct(id, productId);
    return { message: 'Document detached from product', data };
  }
}
