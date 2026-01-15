import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./client";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  // 从数据库获取完整的用户信息
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      username: true,
    },
  });

  // 合并用户信息，将 null 转换为 undefined
  const user = {
    name: dbUser?.name ?? session.user.name,
    email: dbUser?.email ?? session.user.email,
    image: dbUser?.image ?? session.user.image,
    username: dbUser?.username ?? undefined,
  };

  return <SettingsClient user={user} />;
}
