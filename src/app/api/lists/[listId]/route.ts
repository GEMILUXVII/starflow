import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateListSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  description: z.string().max(200).optional(),
});

// GET single list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = await params;

    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { repositories: true },
        },
      },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: list.id,
      name: list.name,
      color: list.color,
      description: list.description,
      count: list._count.repositories,
    });
  } catch (error) {
    console.error("Get list error:", error);
    return NextResponse.json(
      { error: "Failed to get list" },
      { status: 500 }
    );
  }
}

// PATCH - Update list
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = await params;
    const body = await request.json();
    const parsed = updateListSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Check if list exists and belongs to user
    const existing = await prisma.list.findFirst({
      where: {
        id: listId,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // If name is being changed, check for duplicates
    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await prisma.list.findFirst({
        where: {
          userId: session.user.id,
          name: parsed.data.name,
          id: { not: listId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "List name already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.list.update({
      where: { id: listId },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update list error:", error);
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

// DELETE - Delete list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = await params;

    // Check if list exists and belongs to user
    const existing = await prisma.list.findFirst({
      where: {
        id: listId,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Delete list (cascade will handle ListRepository records)
    await prisma.list.delete({
      where: { id: listId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete list error:", error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
