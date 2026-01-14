import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  archived: boolean;
  html_url: string;
  homepage: string | null;
  topics: string[];
  pushed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface StarredRepo extends GitHubRepo {
  starred_at?: string;
}

async function fetchAllStarredRepos(accessToken: string): Promise<StarredRepo[]> {
  const repos: StarredRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/user/starred?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.star+json", // 获取 starred_at 信息
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) break;

    // API 返回的格式是 { starred_at, repo } 当使用 star+json accept header
    for (const item of data) {
      const repo = item.repo || item;
      repos.push({
        ...repo,
        starred_at: item.starred_at,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return repos;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      },
      select: { access_token: true },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    // 从 GitHub 获取所有 starred 仓库
    const starredRepos = await fetchAllStarredRepos(account.access_token);

    // 批量处理仓库
    for (const repo of starredRepos) {
      // 创建或更新仓库信息
      const repository = await prisma.repository.upsert({
        where: { githubId: repo.id },
        update: {
          fullName: repo.full_name,
          name: repo.name,
          owner: repo.owner.login,
          description: repo.description,
          language: repo.language,
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          isArchived: repo.archived,
          htmlUrl: repo.html_url,
          homepage: repo.homepage,
          topics: JSON.stringify(repo.topics || []),
          pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          repoCreatedAt: repo.created_at ? new Date(repo.created_at) : null,
          repoUpdatedAt: repo.updated_at ? new Date(repo.updated_at) : null,
        },
        create: {
          githubId: repo.id,
          fullName: repo.full_name,
          name: repo.name,
          owner: repo.owner.login,
          description: repo.description,
          language: repo.language,
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          isArchived: repo.archived,
          htmlUrl: repo.html_url,
          homepage: repo.homepage,
          topics: JSON.stringify(repo.topics || []),
          pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          repoCreatedAt: repo.created_at ? new Date(repo.created_at) : null,
          repoUpdatedAt: repo.updated_at ? new Date(repo.updated_at) : null,
        },
      });

      // 创建或更新用户-仓库关联
      await prisma.userRepository.upsert({
        where: {
          userId_repositoryId: {
            userId: session.user.id,
            repositoryId: repository.id,
          },
        },
        update: {
          isStarred: true,
          starredAt: repo.starred_at ? new Date(repo.starred_at) : new Date(),
        },
        create: {
          userId: session.user.id,
          repositoryId: repository.id,
          starredAt: repo.starred_at ? new Date(repo.starred_at) : new Date(),
          isStarred: true,
        },
      });
    }

    // 更新用户最后同步时间
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSyncAt: new Date() },
    });

    // 标记不再 starred 的仓库
    const currentGithubIds = starredRepos.map((r) => r.id);
    const userRepos = await prisma.userRepository.findMany({
      where: { userId: session.user.id, isStarred: true },
      include: { repository: true },
    });

    for (const userRepo of userRepos) {
      if (!currentGithubIds.includes(userRepo.repository.githubId)) {
        await prisma.userRepository.update({
          where: { id: userRepo.id },
          data: { isStarred: false },
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: starredRepos.length,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
