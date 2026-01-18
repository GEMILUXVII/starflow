import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAIProvider } from "@/lib/ai";
import { getReadmeSummary } from "@/lib/ai/readme";

// POST /api/ai/classify - AI 分类单个仓库
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { repositoryId } = body;

  if (!repositoryId) {
    return NextResponse.json({ error: "repositoryId is required" }, { status: 400 });
  }

  // 获取 AI 配置
  const config = await prisma.aIConfig.findUnique({
    where: { userId: session.user.id },
  });

  if (!config || !config.apiKey || !config.enabled) {
    return NextResponse.json({ error: "AI not configured or disabled" }, { status: 400 });
  }

  // 获取用户信息（需要 accessToken 来获取 README）
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accessToken: true },
  });

  // 获取仓库信息 (repositoryId 实际上是 UserRepository 的 id)
  const userRepo = await prisma.userRepository.findFirst({
    where: {
      id: repositoryId,
      userId: session.user.id,
      isStarred: true,
    },
    include: {
      repository: true,
    },
  });

  if (!userRepo) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  // 获取用户的所有 Lists
  const lists = await prisma.list.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  // 解析 topics
  let topics: string[] = [];
  try {
    topics = JSON.parse(userRepo.repository.topics || "[]");
  } catch {
    topics = [];
  }

  const repo = userRepo.repository;

  // 判断是否需要获取 README（description 为空或很短，且没有缓存的 README）
  let readmeSummary = repo.readmeSummary;
  const needsReadme = (!repo.description || repo.description.length < 20) && !readmeSummary;

  if (needsReadme && user?.accessToken) {
    try {
      readmeSummary = await getReadmeSummary(repo.owner, repo.name, user.accessToken);

      // 缓存到数据库
      if (readmeSummary) {
        await prisma.repository.update({
          where: { id: repo.id },
          data: { readmeSummary },
        });
      }
    } catch (error) {
      console.error("Failed to fetch README:", error);
      // 继续执行，即使获取 README 失败
    }
  }

  // 调用 AI 分类
  try {
    const provider = createAIProvider({
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
    });

    // 获取用户语言设置
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value || "zh";

    const result = await provider.classify(
      {
        id: repo.id,
        fullName: repo.fullName,
        name: repo.name,
        owner: repo.owner,
        description: repo.description,
        language: repo.language,
        topics,
        readmeSummary,
      },
      lists,
      { locale }
    );

    return NextResponse.json({
      repositoryId,
      repositoryName: repo.fullName,
      suggestion: result,
    });
  } catch (error) {
    console.error("AI classify error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "AI classification failed"
    }, { status: 500 });
  }
}
