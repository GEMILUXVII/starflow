import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createListSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description: z.string().max(200).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lists = await prisma.list.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { repositories: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      lists.map((list) => ({
        id: list.id,
        name: list.name,
        color: list.color,
        description: list.description,
        count: list._count.repositories,
      }))
    );
  } catch (error) {
    console.error("Get lists error:", error);
    return NextResponse.json(
      { error: "Failed to get lists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createListSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, color, description } = parsed.data;

    // 检查名称是否已存在
    const existing = await prisma.list.findUnique({
      where: {
        userId_name: {
          userId: session.user.id,
          name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "List name already exists" },
        { status: 409 }
      );
    }

    // 获取当前最大 order
    const maxOrder = await prisma.list.aggregate({
      where: { userId: session.user.id },
      _max: { order: true },
    });

    const list = await prisma.list.create({
      data: {
        userId: session.user.id,
        name,
        color,
        description,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error("Create list error:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
