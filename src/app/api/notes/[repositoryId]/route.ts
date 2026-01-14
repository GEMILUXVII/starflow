import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().max(10000),
});

// GET - Get note for a repository
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repositoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repositoryId } = await params;

    // First get the repository's internal ID from UserRepository
    const userRepo = await prisma.userRepository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
      select: { repositoryId: true },
    });

    if (!userRepo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const note = await prisma.note.findUnique({
      where: {
        userId_repositoryId: {
          userId: session.user.id,
          repositoryId: userRepo.repositoryId,
        },
      },
    });

    return NextResponse.json({
      content: note?.content || "",
      updatedAt: note?.updatedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Get note error:", error);
    return NextResponse.json(
      { error: "Failed to get note" },
      { status: 500 }
    );
  }
}

// PUT - Create or update note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ repositoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repositoryId } = await params;
    const body = await request.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // First get the repository's internal ID from UserRepository
    const userRepo = await prisma.userRepository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
      select: { repositoryId: true },
    });

    if (!userRepo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const { content } = parsed.data;

    // If content is empty, delete the note
    if (!content.trim()) {
      await prisma.note.deleteMany({
        where: {
          userId: session.user.id,
          repositoryId: userRepo.repositoryId,
        },
      });
      return NextResponse.json({ success: true, deleted: true });
    }

    const note = await prisma.note.upsert({
      where: {
        userId_repositoryId: {
          userId: session.user.id,
          repositoryId: userRepo.repositoryId,
        },
      },
      update: {
        content,
      },
      create: {
        userId: session.user.id,
        repositoryId: userRepo.repositoryId,
        content,
      },
    });

    return NextResponse.json({
      content: note.content,
      updatedAt: note.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ repositoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repositoryId } = await params;

    // First get the repository's internal ID from UserRepository
    const userRepo = await prisma.userRepository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
      select: { repositoryId: true },
    });

    if (!userRepo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    await prisma.note.deleteMany({
      where: {
        userId: session.user.id,
        repositoryId: userRepo.repositoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
