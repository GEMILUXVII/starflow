import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      githubId: true,
      _count: {
        select: {
          repositories: true,
          accounts: true,
        }
      }
    }
  });

  console.log('Current users:');
  for (const user of users) {
    console.log(`\n- User ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Username: @${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  GitHub ID: ${user.githubId}`);
    console.log(`  Repositories: ${user._count.repositories}`);
    console.log(`  Accounts: ${user._count.accounts}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
