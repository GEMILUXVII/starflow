import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all list-repository relations first
    await prisma.listRepository.deleteMany({
      where: {
        list: {
          userId: session.user.id,
        },
      },
    });

    // Delete all lists for this user
    await prisma.list.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear lists error:", error);
    return NextResponse.json(
      { error: "Failed to clear lists" },
      { status: 500 }
    );
  }
}
