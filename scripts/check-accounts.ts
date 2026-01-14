import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.account.findMany({
    include: {
      user: {
        select: {
          name: true,
          username: true,
          githubId: true,
        }
      }
    }
  });

  console.log('Current accounts:');
  for (const account of accounts) {
    console.log(`\n- Account ID: ${account.id}`);
    console.log(`  Provider: ${account.provider}`);
    console.log(`  Provider Account ID: ${account.providerAccountId}`);
    console.log(`  User: ${account.user.name} (@${account.user.username})`);
    console.log(`  User GitHub ID: ${account.user.githubId}`);
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
