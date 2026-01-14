import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ listId: string; repoId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId, repoId } = await params;

    // 验证 list 属于当前用户
    const list = await prisma.list.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // 删除关联
    await prisma.listRepository.deleteMany({
      where: {
        listId,
        userRepositoryId: repoId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove from list error:", error);
    return NextResponse.json(
      { error: "Failed to remove from list" },
      { status: 500 }
    );
  }
}
