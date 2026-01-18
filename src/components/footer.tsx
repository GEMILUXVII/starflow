"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{t("copyright", { year: currentYear })}</span>
            <span>{t("allRightsReserved")}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              {t("terms")}
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
