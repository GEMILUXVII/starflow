import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all notes for this user
    await prisma.note.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear notes error:", error);
    return NextResponse.json(
      { error: "Failed to clear notes" },
      { status: 500 }
    );
  }
}
