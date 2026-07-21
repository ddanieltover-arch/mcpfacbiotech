import type { PrismaClient, UserRole } from '@prisma/client';

const PERMISSIONS: { module: string; action: string; description: string }[] = [
  { module: 'products', action: 'read', description: 'View products' },
  { module: 'products', action: 'create', description: 'Create products' },
  { module: 'products', action: 'update', description: 'Update products' },
  { module: 'products', action: 'delete', description: 'Delete products' },
  { module: 'orders', action: 'read', description: 'View orders' },
  { module: 'orders', action: 'create', description: 'Place orders' },
  { module: 'orders', action: 'update', description: 'Update orders' },
  { module: 'orders', action: 'approve', description: 'Approve orders' },
  { module: 'quotes', action: 'read', description: 'View quotes' },
  { module: 'quotes', action: 'create', description: 'Request quotes' },
  { module: 'quotes', action: 'update', description: 'Update quotes' },
  { module: 'quotes', action: 'approve', description: 'Approve quotes' },
  { module: 'customers', action: 'read', description: 'View customers' },
  { module: 'customers', action: 'update', description: 'Update customers' },
  { module: 'documents', action: 'read', description: 'Download documents' },
  { module: 'admin', action: 'access', description: 'Access admin dashboard' },
];

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  GUEST: ['products:read'],
  CUSTOMER: [
    'products:read',
    'orders:read',
    'orders:create',
    'quotes:read',
    'quotes:create',
    'documents:read',
  ],
  RESEARCH_CUSTOMER: [
    'products:read',
    'orders:read',
    'orders:create',
    'quotes:read',
    'quotes:create',
    'documents:read',
  ],
  DISTRIBUTOR: [
    'products:read',
    'orders:read',
    'orders:create',
    'quotes:read',
    'quotes:create',
    'documents:read',
  ],
  WHOLESALE_CUSTOMER: [
    'products:read',
    'orders:read',
    'orders:create',
    'quotes:read',
    'quotes:create',
    'documents:read',
  ],
  SUPPORT: [
    'products:read',
    'orders:read',
    'orders:update',
    'quotes:read',
    'quotes:update',
    'customers:read',
    'customers:update',
    'documents:read',
    'admin:access',
  ],
  CONTENT_EDITOR: ['products:read', 'products:create', 'products:update', 'admin:access'],
  INVENTORY_MANAGER: [
    'products:read',
    'products:create',
    'products:update',
    'orders:read',
    'admin:access',
  ],
  ADMINISTRATOR: PERMISSIONS.map((p) => `${p.module}:${p.action}`),
  SUPER_ADMINISTRATOR: PERMISSIONS.map((p) => `${p.module}:${p.action}`),
};

export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        module_action: {
          module: permission.module,
          action: permission.action,
        },
      },
      create: permission,
      update: { description: permission.description },
    });
  }

  const allPermissions = await prisma.permission.findMany();
  const permissionByKey = new Map(
    allPermissions.map((p) => [`${p.module}:${p.action}`, p.id]),
  );

  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSIONS) as [
    UserRole,
    string[],
  ][]) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    for (const key of permissionKeys) {
      const permissionId = permissionByKey.get(key);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
        create: {
          roleId: role.id,
          permissionId,
        },
        update: {},
      });
    }
  }
}
