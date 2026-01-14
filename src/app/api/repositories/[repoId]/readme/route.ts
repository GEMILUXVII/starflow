import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;

    // Get repository info
    const userRepo = await prisma.userRepository.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
      include: {
        repository: true,
      },
    });

    if (!userRepo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Get access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
      select: { access_token: true },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    const fullName = userRepo.repository.fullName;

    // Fetch README from GitHub API
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${fullName}/readme`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          Accept: "application/vnd.github.raw+json",
        },
      }
    );

    if (!readmeResponse.ok) {
      if (readmeResponse.status === 404) {
        return NextResponse.json({
          content: null,
          message: "此仓库没有 README 文件",
        });
      }
      throw new Error(`GitHub API error: ${readmeResponse.status}`);
    }

    const content = await readmeResponse.text();

    return NextResponse.json({
      content,
      fullName,
    });
  } catch (error) {
    console.error("Get README error:", error);
    return NextResponse.json(
      { error: "Failed to get README" },
      { status: 500 }
    );
  }
}
