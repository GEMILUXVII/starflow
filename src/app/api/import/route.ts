import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const importSchema = z.object({
  version: z.string().optional(),
  lists: z.array(
    z.object({
      name: z.string(),
      color: z.string(),
      description: z.string().nullable().optional(),
    })
  ).optional(),
  repositories: z.array(
    z.object({
      fullName: z.string(),
      lists: z.array(z.string()).optional(),
    })
  ).optional(),
  notes: z.array(
    z.object({
      repository: z.string(),
      content: z.string(),
    })
  ).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid import data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const data = parsed.data;
    const results = {
      listsCreated: 0,
      listsSkipped: 0,
      reposUpdated: 0,
      reposNotFound: 0,
      notesCreated: 0,
    };

    // Import lists
    if (data.lists && data.lists.length > 0) {
      const existingLists = await prisma.list.findMany({
        where: { userId },
        select: { name: true },
      });
      const existingNames = new Set(existingLists.map((l) => l.name));

      const maxOrder = await prisma.list.aggregate({
        where: { userId },
        _max: { order: true },
      });
      let order = (maxOrder._max.order || 0) + 1;

      for (const list of data.lists) {
        if (existingNames.has(list.name)) {
          results.listsSkipped++;
          continue;
        }

        await prisma.list.create({
          data: {
            userId,
            name: list.name,
            color: list.color,
            description: list.description || null,
            order: order++,
          },
        });
        results.listsCreated++;
      }
    }

    // Get all lists for mapping
    const allLists = await prisma.list.findMany({
      where: { userId },
    });
    const listNameToId = new Map(allLists.map((l) => [l.name, l.id]));

    // Import repository-list associations
    if (data.repositories && data.repositories.length > 0) {
      for (const repoData of data.repositories) {
        // Find the user's repository by fullName
        const userRepo = await prisma.userRepository.findFirst({
          where: {
            userId,
            isStarred: true,
            repository: { fullName: repoData.fullName },
          },
        });

        if (!userRepo) {
          results.reposNotFound++;
          continue;
        }

        // Add to lists
        if (repoData.lists && repoData.lists.length > 0) {
          for (const listName of repoData.lists) {
            const listId = listNameToId.get(listName);
            if (!listId) continue;

            // Check if already in list
            const existing = await prisma.listRepository.findUnique({
              where: {
                listId_userRepositoryId: {
                  listId,
                  userRepositoryId: userRepo.id,
                },
              },
            });

            if (!existing) {
              await prisma.listRepository.create({
                data: {
                  listId,
                  userRepositoryId: userRepo.id,
                },
              });
            }
          }
          results.reposUpdated++;
        }
      }
    }

    // Import notes
    if (data.notes && data.notes.length > 0) {
      for (const noteData of data.notes) {
        // Find the repository
        const repo = await prisma.repository.findFirst({
          where: { fullName: noteData.repository },
        });

        if (!repo) continue;

        // Check if user has this repo starred
        const userRepo = await prisma.userRepository.findFirst({
          where: {
            userId,
            repositoryId: repo.id,
            isStarred: true,
          },
        });

        if (!userRepo) continue;

        // Upsert note
        await prisma.note.upsert({
          where: {
            userId_repositoryId: {
              userId,
              repositoryId: repo.id,
            },
          },
          update: {
            content: noteData.content,
          },
          create: {
            userId,
            repositoryId: repo.id,
            content: noteData.content,
          },
        });
        results.notesCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}
