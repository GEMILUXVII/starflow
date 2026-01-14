import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ listId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = await params;
    const body = await request.json();
    const { repositoryId } = body;

    if (!repositoryId) {
      return NextResponse.json(
        { error: "repositoryId is required" },
        { status: 400 }
      );
    }

    // 验证 list 属于当前用户
    const list = await prisma.list.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // 验证 userRepository 属于当前用户
    const userRepository = await prisma.userRepository.findFirst({
      where: { id: repositoryId, userId: session.user.id },
    });

    if (!userRepository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // 添加到 list
    await prisma.listRepository.upsert({
      where: {
        listId_userRepositoryId: {
          listId,
          userRepositoryId: repositoryId,
        },
      },
      update: {},
      create: {
        listId,
        userRepositoryId: repositoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add to list error:", error);
    return NextResponse.json(
      { error: "Failed to add to list" },
      { status: 500 }
    );
  }
}
