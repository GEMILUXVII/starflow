import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/stars">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">隐私政策</h1>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">数据收集</h2>
            <p>
              Starflow 仅通过 GitHub OAuth 收集您的基本账户信息（用户名、邮箱、头像）以及您的 GitHub Stars 数据。
              所有数据仅用于提供服务功能。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">数据存储</h2>
            <p>
              您的数据存储在本地数据库中。我们不会将您的个人信息出售、交易或转让给第三方。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">数据安全</h2>
            <p>
              我们采取合理的安全措施来保护您的数据。但请注意，互联网传输的安全性无法得到完全保证。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第三方服务</h2>
            <p>
              本应用使用 GitHub OAuth 进行身份验证。使用 GitHub 服务时，您需要遵守 GitHub 的隐私政策和服务条款。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">您的权利</h2>
            <p>
              您可以随时在设置页面中：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>导出您的数据</li>
              <li>删除您的笔记和列表</li>
              <li>重置所有数据</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">政策更新</h2>
            <p>
              我们可能会不时更新此隐私政策。重大变更时，我们会在应用中通知您。
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
