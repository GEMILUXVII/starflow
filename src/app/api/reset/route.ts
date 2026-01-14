import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all notes
    await prisma.note.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    // Delete all list-repository relations
    await prisma.listRepository.deleteMany({
      where: {
        list: {
          userId: session.user.id,
        },
      },
    });

    // Delete all lists
    await prisma.list.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    // Reset sync timestamp
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSyncAt: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset data" },
      { status: 500 }
    );
  }
}
