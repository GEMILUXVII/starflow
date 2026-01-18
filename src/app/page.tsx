import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { StarsBackground } from "@/components/stars-background";
import { LanguageToggle } from "@/components/language-toggle";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const session = await auth();
  const t = await getTranslations("home");

  if (session) {
    redirect("/stars");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <StarsBackground />

      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Logo size={64} />
          <h1 className="text-6xl md:text-7xl font-[family-name:var(--font-righteous)] tracking-wide text-foreground">
            Starflow
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl text-muted-foreground mb-6">
          {t("tagline")}
        </p>
        <p className="text-base text-muted-foreground/60 mb-16">
          {t("features")}
        </p>

        {/* CTA Button - Direct Login */}
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/stars" });
          }}
        >
          <Button type="submit" size="lg" className="text-base px-8 h-12">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {t("loginWithGithub")}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-12 text-sm text-muted-foreground/40">
          {t("footer")}
        </p>

        {/* Legal Links */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground/30">
          <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
            {t("privacy")}
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-muted-foreground transition-colors">
            {t("terms")}
          </Link>
        </div>
      </div>
    </div>
  );
}
