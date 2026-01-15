import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAIProvider } from "@/lib/ai";

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

  // 调用 AI 分类
  try {
    const provider = createAIProvider({
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
    });

    const result = await provider.classify(
      {
        id: userRepo.repository.id,
        fullName: userRepo.repository.fullName,
        name: userRepo.repository.name,
        owner: userRepo.repository.owner,
        description: userRepo.repository.description,
        language: userRepo.repository.language,
        topics,
      },
      lists
    );

    return NextResponse.json({
      repositoryId,
      repositoryName: userRepo.repository.fullName,
      suggestion: result,
    });
  } catch (error) {
    console.error("AI classify error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "AI classification failed"
    }, { status: 500 });
  }
}
