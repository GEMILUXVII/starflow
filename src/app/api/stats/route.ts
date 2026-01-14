import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取总 star 数
    const totalStars = await prisma.userRepository.count({
      where: { userId, isStarred: true },
    });

    // 获取未分类数量
    const uncategorizedCount = await prisma.userRepository.count({
      where: {
        userId,
        isStarred: true,
        lists: { none: {} },
      },
    });

    // 获取语言统计
    const languageStats = await prisma.userRepository.findMany({
      where: { userId, isStarred: true },
      include: {
        repository: {
          select: { language: true },
        },
      },
    });

    const languageMap = new Map<string, number>();
    for (const ur of languageStats) {
      const lang = ur.repository.language;
      if (lang) {
        languageMap.set(lang, (languageMap.get(lang) || 0) + 1);
      }
    }

    const languages = Array.from(languageMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 获取 Lists 统计
    const listsWithCount = await prisma.list.findMany({
      where: { userId },
      include: {
        _count: {
          select: { repositories: true },
        },
      },
      orderBy: { order: "asc" },
    });

    const lists = listsWithCount.map((list) => ({
      id: list.id,
      name: list.name,
      color: list.color,
      count: list._count.repositories,
    }));

    // 获取最后同步时间
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastSyncAt: true },
    });

    return NextResponse.json({
      totalStars,
      uncategorizedCount,
      languages,
      lists,
      lastSyncAt: user?.lastSyncAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
