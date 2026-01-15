import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {currentYear} Starflow.</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              隐私政策
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              服务条款
            </Link>
            <a
              href="https://github.com/GEMILUXVII/starflow"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
