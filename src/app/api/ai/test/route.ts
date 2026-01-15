import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAIProvider } from "@/lib/ai";

// POST /api/ai/test - 测试 AI 连接
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.aIConfig.findUnique({
    where: { userId: session.user.id },
  });

  if (!config || !config.apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 400 });
  }

  try {
    const provider = createAIProvider({
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
    });

    const success = await provider.testConnection();

    return NextResponse.json({ success });
  } catch (error) {
    console.error("AI test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
