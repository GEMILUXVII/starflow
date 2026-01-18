"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();
  const t = useTranslations("terms");
  const locale = useLocale();

  const formattedDate = new Date().toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US");

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>

        <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("serviceDescription")}</h2>
            <p>{t("serviceDescriptionContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("license")}</h2>
            <p>{t("licenseContent")}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t("licenseItem1")}</li>
              <li>{t("licenseItem2")}</li>
              <li>{t("licenseItem3")}</li>
              <li>{t("licenseItem4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("accountSecurity")}</h2>
            <p>{t("accountSecurityContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("serviceChanges")}</h2>
            <p>{t("serviceChangesContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("disclaimer")}</h2>
            <p>{t("disclaimerContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("limitationOfLiability")}</h2>
            <p>{t("limitationOfLiabilityContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("thirdPartyLinks")}</h2>
            <p>{t("thirdPartyLinksContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("termsChanges")}</h2>
            <p>{t("termsChangesContent")}</p>
          </section>

          <section>
            <p className="text-sm text-muted-foreground">
              {t("lastUpdated", { date: formattedDate })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
