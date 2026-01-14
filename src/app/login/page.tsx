import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default async function LoginPage() {
  const session = await auth();
  
  if (session) {
    redirect("/stars");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Logo size={36} />
            <span className="font-[family-name:var(--font-righteous)] tracking-wider">
              Starflow
            </span>
          </CardTitle>
          <CardDescription>
            管理你的 GitHub Stars，让收藏更有条理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/stars" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              使用 GitHub 登录
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            登录即表示你同意我们访问你的 GitHub starred 仓库
          </p>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
        <Link href="/privacy" className="hover:text-slate-200 transition-colors">
          隐私政策
        </Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-slate-200 transition-colors">
          服务条款
        </Link>
      </div>
    </div>
  );
}
