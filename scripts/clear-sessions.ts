import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all sessions and accounts...');

  // 删除所有 sessions
  const sessions = await prisma.session.deleteMany({});
  console.log(`Deleted ${sessions.count} sessions`);

  // 删除所有 accounts
  const accounts = await prisma.account.deleteMany({});
  console.log(`Deleted ${accounts.count} accounts`);

  console.log('Done! Please restart the server and login again.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
