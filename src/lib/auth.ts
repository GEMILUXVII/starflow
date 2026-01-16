import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 对于已存在的用户，更新 token（可能已过期）
      if (account?.provider === "github" && profile && user.id) {
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
          avatar_url: string;
        };

        // 尝试更新用户信息（如果用户存在）
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
        } catch {
          // 用户可能还不存在（首次登录），忽略错误
          // linkAccount 事件会处理首次登录的情况
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
    // 账户关联后触发（首次登录时，用户已创建）
    async linkAccount({ user, account, profile }) {
      if (account.provider === "github" && profile) {
        const githubProfile = profile as unknown as {
          id: number;
          login: string;
          avatar_url: string;
        };

        // 更新用户的 GitHub 特定信息
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: githubProfile.id,
            username: githubProfile.login,
            avatarUrl: githubProfile.avatar_url,
            accessToken: account.access_token || "",
          },
        });
        console.log("User linked and updated:", user.id);
      }
    },
  },
  pages: {
    signIn: "/",
  },
});
