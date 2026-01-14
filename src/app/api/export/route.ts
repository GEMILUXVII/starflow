import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const format = request.nextUrl.searchParams.get("format") || "json";
    const userId = session.user.id;

    // Get all user data
    const [userRepos, lists, notes] = await Promise.all([
      prisma.userRepository.findMany({
        where: { userId, isStarred: true },
        include: {
          repository: true,
          lists: {
            include: {
              list: {
                select: { name: true, color: true },
              },
            },
          },
        },
        orderBy: { starredAt: "desc" },
      }),
      prisma.list.findMany({
        where: { userId },
        orderBy: { order: "asc" },
      }),
      prisma.note.findMany({
        where: { userId },
        include: {
          repository: {
            select: { fullName: true },
          },
        },
      }),
    ]);

    // Build export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      lists: lists.map((l) => ({
        name: l.name,
        color: l.color,
        description: l.description,
      })),
      repositories: userRepos.map((ur) => ({
        fullName: ur.repository.fullName,
        githubId: ur.repository.githubId,
        description: ur.repository.description,
        language: ur.repository.language,
        stargazersCount: ur.repository.stargazersCount,
        htmlUrl: ur.repository.htmlUrl,
        starredAt: ur.starredAt.toISOString(),
        lists: ur.lists.map((l) => l.list.name),
      })),
      notes: notes.map((n) => ({
        repository: n.repository.fullName,
        content: n.content,
        updatedAt: n.updatedAt.toISOString(),
      })),
    };

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "fullName",
        "description",
        "language",
        "stargazersCount",
        "htmlUrl",
        "starredAt",
        "lists",
        "note",
      ];

      const noteMap = new Map(notes.map((n) => [n.repository.fullName, n.content]));

      const rows = userRepos.map((ur) => {
        const note = noteMap.get(ur.repository.fullName) || "";
        return [
          ur.repository.fullName,
          (ur.repository.description || "").replace(/"/g, '""'),
          ur.repository.language || "",
          ur.repository.stargazersCount.toString(),
          ur.repository.htmlUrl,
          ur.starredAt.toISOString(),
          ur.lists.map((l) => l.list.name).join(";"),
          note.replace(/"/g, '""'),
        ]
          .map((v) => `"${v}"`)
          .join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="starflow-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="starflow-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}
