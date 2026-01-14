import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding duplicate email users...');

  // 找出所有用户
  const users = await prisma.user.findMany({
    select: { id: true, email: true, githubId: true, createdAt: true }
  });

  // 按 email 分组
  const emailMap = new Map<string, typeof users>();
  for (const user of users) {
    if (!user.email) continue;

    if (!emailMap.has(user.email)) {
      emailMap.set(user.email, []);
    }
    emailMap.get(user.email)!.push(user);
  }

  // 找出重复的email
  for (const [email, duplicates] of emailMap) {
    if (duplicates.length > 1) {
      console.log(`\nFound ${duplicates.length} users with email: ${email}`);

      // 保留最新的一个，删除其他的
      duplicates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const keep = duplicates[0];
      const toDelete = duplicates.slice(1);

      console.log(`  Keeping user: ${keep.id} (githubId: ${keep.githubId})`);

      for (const user of toDelete) {
        console.log(`  Deleting user: ${user.id} (githubId: ${user.githubId})`);

        // 删除关联数据
        await prisma.userRepository.deleteMany({ where: { userId: user.id } });
        await prisma.list.deleteMany({ where: { userId: user.id } });
        await prisma.note.deleteMany({ where: { userId: user.id } });
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.account.deleteMany({ where: { userId: user.id } });

        // 删除用户
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
  }

  console.log('\nDone! You can now run: npx prisma db push');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
