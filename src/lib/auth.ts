import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email public_repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile && user.id) {
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
          avatar_url: string;
        };
        
        // 更新用户的 GitHub 特定信息
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              githubId: githubProfile.id,
              username: githubProfile.login,
              avatarUrl: githubProfile.avatar_url,
              accessToken: account.access_token || "",
            },
          });
        } catch (error) {
          // 如果用户不存在，忽略错误，让 adapter 处理创建
          console.log("User update skipped:", error);
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true, githubId: true },
        });
        if (dbUser) {
          (session.user as any).username = dbUser.username;
          (session.user as any).githubId = dbUser.githubId;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // 用户首次创建后，获取 GitHub profile 信息
      // 这个事件在 adapter 创建用户后触发
      console.log("User created:", user.id);
    },
  },
  pages: {
    signIn: "/login",
  },
});
