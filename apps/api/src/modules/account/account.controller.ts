import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@mcpfac/shared-types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AccountService } from './account.service';
import { UpdateAccountProfileDto, UpsertAddressDto } from './dto/account.dto';

@ApiTags('account')
@ApiBearerAuth('supabase-auth')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Customer portal dashboard summary' })
  async dashboard(@CurrentUser() user: AuthUser) {
    const data = await this.accountService.getDashboard(user.profileId!);

    return {
      message: 'Account dashboard retrieved',
      data,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get account profile' })
  async getProfile(@CurrentUser() user: AuthUser) {
    const data = await this.accountService.getProfile(user.profileId!);

    return {
      message: 'Account profile retrieved',
      data,
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update account profile' })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateAccountProfileDto,
  ) {
    const data = await this.accountService.updateProfile(user.profileId!, body);

    return {
      message: 'Account profile updated',
      data,
    };
  }

  @Get('addresses')
  @ApiOperation({ summary: 'List saved addresses' })
  async listAddresses(@CurrentUser() user: AuthUser) {
    const data = await this.accountService.listAddresses(user.profileId!);

    return {
      message: 'Addresses retrieved',
      data,
    };
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Create a saved address' })
  async createAddress(
    @CurrentUser() user: AuthUser,
    @Body() body: UpsertAddressDto,
  ) {
    const data = await this.accountService.createAddress(user.profileId!, body);

    return {
      message: 'Address created',
      data,
    };
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update a saved address' })
  async updateAddress(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertAddressDto,
  ) {
    const data = await this.accountService.updateAddress(user.profileId!, id, body);

    return {
      message: 'Address updated',
      data,
    };
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete a saved address' })
  async deleteAddress(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.accountService.deleteAddress(user.profileId!, id);

    return {
      message: 'Address deleted',
      data: null,
    };
  }
}
