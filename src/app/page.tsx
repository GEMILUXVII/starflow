import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/stars");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="text-center max-w-2xl px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg className="w-16 h-16 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <h1 className="text-5xl font-bold">Starflow</h1>
        </div>

        <p className="text-xl text-slate-300 mb-8">
          一个简洁高效的 GitHub Stars 管理工具。
          <br />
          整理你的收藏，让 Stars 不再杂乱无章。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">分类管理</h3>
            <p className="text-sm text-slate-400">
              创建自定义 Lists，将仓库按项目、技术栈或用途分类
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">快速搜索</h3>
            <p className="text-sm text-slate-400">
              按名称、描述、语言快速筛选，找到你需要的仓库
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">双向同步</h3>
            <p className="text-sm text-slate-400">
              与 GitHub 实时同步，取消 Star 也会同步到你的账号
            </p>
          </div>
        </div>

        <Link href="/login">
          <Button size="lg" className="text-lg px-8">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            使用 GitHub 登录
          </Button>
        </Link>

        <p className="text-xs text-slate-500 mt-4">
          开源项目 · 自托管 · 数据由你掌控
        </p>
      </div>
    </div>
  );
}
