import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/ai/config - 获取 AI 配置
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.aIConfig.findUnique({
    where: { userId: session.user.id },
    select: {
      provider: true,
      baseUrl: true,
      model: true,
      enabled: true,
      apiKey: true,
      requestInterval: true,
      concurrency: true,
    },
  });

  return NextResponse.json({
    provider: config?.provider,
    baseUrl: config?.baseUrl,
    model: config?.model,
    enabled: config?.enabled,
    hasApiKey: !!config?.apiKey,
    requestInterval: config?.requestInterval ?? 1000,
    concurrency: config?.concurrency ?? 3,
  });
}

// POST /api/ai/config - 保存 AI 配置
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { provider, apiKey, baseUrl, model, enabled, requestInterval, concurrency } = body;

  const config = await prisma.aIConfig.upsert({
    where: { userId: session.user.id },
    update: {
      provider,
      apiKey,
      baseUrl,
      model,
      enabled,
      requestInterval: requestInterval ?? 1000,
      concurrency: concurrency ?? 3,
    },
    create: {
      userId: session.user.id,
      provider,
      apiKey,
      baseUrl,
      model,
      enabled,
      requestInterval: requestInterval ?? 1000,
      concurrency: concurrency ?? 3,
    },
  });

  return NextResponse.json({
    provider: config.provider,
    baseUrl: config.baseUrl,
    model: config.model,
    enabled: config.enabled,
    hasApiKey: !!config.apiKey,
    requestInterval: config.requestInterval,
    concurrency: config.concurrency,
  });
}
