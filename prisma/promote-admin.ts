import { PrismaClient, UserRole } from '@prisma/client';
import { loadEnvFiles } from './migrate-legacy/load-env';

loadEnvFiles();

/**
 * Promote an existing profile to ADMINISTRATOR by email.
 *
 * PowerShell:
 *   $env:ADMIN_EMAIL="you@example.com"; pnpm db:promote-admin
 *
 * bash:
 *   ADMIN_EMAIL=you@example.com pnpm db:promote-admin
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error('Set ADMIN_EMAIL to the user you want to promote');
  }

  const prisma = new PrismaClient();

  try {
    const profile = await prisma.profile.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });

    if (!profile) {
      throw new Error(
        `No profile found for ${email}. Register/login once so auth sync creates the profile.`,
      );
    }

    const role = await prisma.role.findUnique({
      where: { name: UserRole.ADMINISTRATOR },
    });

    if (!role) {
      throw new Error('ADMINISTRATOR role missing — run pnpm db:seed first');
    }

    await prisma.userRoleAssignment.upsert({
      where: {
        profileId_roleId: {
          profileId: profile.id,
          roleId: role.id,
        },
      },
      create: {
        profileId: profile.id,
        roleId: role.id,
      },
      update: {},
    });

    const roles = await prisma.userRoleAssignment.findMany({
      where: { profileId: profile.id },
      include: { role: true },
    });

    console.log(`Promoted ${email} → ADMINISTRATOR`);
    console.log(
      'Current roles:',
      roles.map((row) => row.role.name).join(', '),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
