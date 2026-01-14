import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const listId = searchParams.get("listId");
    const language = searchParams.get("language");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "starredAt";
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // 构建查询条件
    const where: any = {
      userId: session.user.id,
      isStarred: true,
    };

    // 按 List 筛选
    if (listId) {
      if (listId === "uncategorized") {
        where.lists = { none: {} };
      } else {
        where.lists = { some: { listId } };
      }
    }

    // 按语言筛选
    if (language) {
      where.repository = { language };
    }

    // 搜索
    if (search) {
      where.repository = {
        ...where.repository,
        OR: [
          { fullName: { contains: search } },
          { description: { contains: search } },
        ],
      };
    }

    // 排序映射
    const orderByMap: Record<string, any> = {
      starredAt: { starredAt: order },
      stargazersCount: { repository: { stargazersCount: order } },
      pushedAt: { repository: { pushedAt: order } },
      name: { repository: { name: order } },
    };

    const userRepositories = await prisma.userRepository.findMany({
      where,
      include: {
        repository: true,
        lists: {
          include: {
            list: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
      orderBy: orderByMap[sort] || { starredAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const repositories = userRepositories.map((ur) => ({
      id: ur.id,
      githubId: ur.repository.githubId,
      fullName: ur.repository.fullName,
      name: ur.repository.name,
      owner: ur.repository.owner,
      description: ur.repository.description,
      language: ur.repository.language,
      stargazersCount: ur.repository.stargazersCount,
      forksCount: ur.repository.forksCount,
      isArchived: ur.repository.isArchived,
      htmlUrl: ur.repository.htmlUrl,
      pushedAt: ur.repository.pushedAt?.toISOString() || null,
      starredAt: ur.starredAt.toISOString(),
      lists: ur.lists.map((l) => l.list),
    }));

    const total = await prisma.userRepository.count({ where });

    return NextResponse.json({
      repositories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get repositories error:", error);
    return NextResponse.json(
      { error: "Failed to get repositories" },
      { status: 500 }
    );
  }
}
