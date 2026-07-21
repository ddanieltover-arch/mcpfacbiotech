import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CustomerGroup } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

export type CustomerContext = {
  id: string;
  customerGroup: CustomerGroup;
  isSuspended: boolean;
};

@Injectable()
export class CustomerContextService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerByProfileId(profileId: string): Promise<CustomerContext> {
    const customer = await this.prisma.customer.findUnique({
      where: { profileId },
      select: {
        id: true,
        customerGroup: true,
        isSuspended: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found. Sync your account first.');
    }

    return customer;
  }

  async getCustomerIdByProfileId(profileId: string): Promise<string> {
    const customer = await this.getCustomerByProfileId(profileId);
    return customer.id;
  }

  async assertActiveCustomer(profileId: string): Promise<CustomerContext> {
    const customer = await this.getCustomerByProfileId(profileId);

    if (customer.isSuspended) {
      throw new ForbiddenException('Customer account is suspended');
    }

    return customer;
  }
}
