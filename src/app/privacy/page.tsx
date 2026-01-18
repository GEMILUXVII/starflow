"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();
  const t = useTranslations("privacy");
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
            <h2 className="text-2xl font-semibold mb-4">{t("dataCollection")}</h2>
            <p>{t("dataCollectionContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("dataStorage")}</h2>
            <p>{t("dataStorageContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("dataSecurity")}</h2>
            <p>{t("dataSecurityContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("thirdPartyServices")}</h2>
            <p>{t("thirdPartyServicesContent")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("yourRights")}</h2>
            <p>{t("yourRightsContent")}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t("exportData")}</li>
              <li>{t("deleteNotes")}</li>
              <li>{t("resetData")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t("policyUpdates")}</h2>
            <p>{t("policyUpdatesContent")}</p>
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
