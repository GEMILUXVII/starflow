import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/stars">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">服务条款</h1>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">服务说明</h2>
            <p>
              Starflow 是一个 GitHub Stars 管理工具，帮助您更好地组织和管理您在 GitHub 上收藏的仓库。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">使用许可</h2>
            <p>
              我们授予您个人、非商业性使用本服务的权利。您不得：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>将本服务用于任何非法或未经授权的目的</li>
              <li>尝试获取未经授权的访问权限</li>
              <li>干扰或破坏服务的正常运行</li>
              <li>滥用服务资源</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">账户安全</h2>
            <p>
              您需要负责保护您的 GitHub 账户安全。如果发现任何未经授权的使用，请立即通知我们。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">服务变更</h2>
            <p>
              我们保留随时修改或终止服务（或其任何部分）的权利，恕不另行通知。
              我们不对您或任何第三方因修改、暂停或终止服务而承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">免责声明</h2>
            <p>
              本服务按"现状"提供，不提供任何形式的明示或暗示保证。
              我们不保证服务将不间断、及时、安全或无错误。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">责任限制</h2>
            <p>
              在任何情况下，Starflow 及其开发者均不对因使用或无法使用本服务而产生的任何间接、偶然、
              特殊或后果性损害承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第三方链接</h2>
            <p>
              本服务可能包含指向第三方网站或服务的链接。我们不控制这些第三方内容，
              也不对其负责。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">条款变更</h2>
            <p>
              我们保留随时修改这些条款的权利。继续使用本服务即表示您接受修改后的条款。
            </p>
          </section>

          <section>
            <p className="text-sm text-muted-foreground">
              最后更新时间：{new Date().toLocaleDateString("zh-CN")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
