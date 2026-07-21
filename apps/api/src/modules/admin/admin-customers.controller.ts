import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ADMIN_OPS_ROLES } from './admin.constants';
import { AdminCustomersService } from './admin-customers.service';
import { AdminCustomerQueryDto } from './dto/admin-query.dto';
import { UpdateAdminCustomerDto } from './dto/admin-mutations.dto';

@ApiTags('admin-customers')
@ApiBearerAuth('supabase-auth')
@Roles(...ADMIN_OPS_ROLES)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers for account management' })
  async list(@Query() query: AdminCustomerQueryDto) {
    const data = await this.customersService.list(query);
    return {
      message: 'Admin customers retrieved',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer detail' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.customersService.getById(id);
    return {
      message: 'Admin customer retrieved',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Suspend / verify customer or update internal notes' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminCustomerDto,
  ) {
    const data = await this.customersService.update(id, body);
    return {
      message: 'Admin customer updated',
      data,
    };
  }
}
