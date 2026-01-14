import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ repoId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;

    // 获取用户的 access token
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

    const userRepository = await prisma.userRepository.findFirst({
      where: { id: repoId, userId: session.user.id },
      include: { repository: true },
    });

    if (!userRepository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // 调用 GitHub API 取消 star
    const [owner, repo] = userRepository.repository.fullName.split("/");
    const response = await fetch(
      `https://api.github.com/user/starred/${owner}/${repo}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    // 更新本地数据库
    await prisma.userRepository.update({
      where: { id: repoId },
      data: { isStarred: false },
    });

    // 同时删除相关的 list 关联
    await prisma.listRepository.deleteMany({
      where: { userRepositoryId: repoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unstar error:", error);
    return NextResponse.json(
      { error: "Failed to unstar repository" },
      { status: 500 }
    );
  }
}
