"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Check, Plus } from "lucide-react";

interface AiSuggestion {
  suggestedListId: string | null;
  suggestedListName: string | null;
  suggestNewList: boolean;
  newListName?: string;
  confidence: number;
  reason: string;
}

interface AiClassifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryName: string;
  suggestion: AiSuggestion | null;
  loading: boolean;
  error: string | null;
  onApply: (listId: string) => void;
  onCreateAndApply: (listName: string) => void;
}

export function AiClassifyDialog({
  open,
  onOpenChange,
  repositoryName,
  suggestion,
  loading,
  error,
  onApply,
  onCreateAndApply,
}: AiClassifyDialogProps) {
  const [applying, setApplying] = useState(false);
  const t = useTranslations("ai");

  const handleApply = async () => {
    if (!suggestion) return;

    setApplying(true);
    try {
      if (suggestion.suggestNewList && suggestion.newListName) {
        await onCreateAndApply(suggestion.newListName);
      } else if (suggestion.suggestedListId) {
        await onApply(suggestion.suggestedListId);
      }
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  const confidencePercent = suggestion ? Math.round(suggestion.confidence * 100) : 0;
  const confidenceColor = confidencePercent >= 80 ? "text-green-600" : confidencePercent >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("suggestion")}
          </DialogTitle>
          <DialogDescription className="truncate">
            {repositoryName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t("classifying")}</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-destructive">{error}</p>
            </div>
          ) : suggestion ? (
            <div className="space-y-4">
              {/* 建议的 List */}
              <div className="p-4 bg-muted rounded-lg">
                {suggestion.suggestNewList ? (
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{t("newListSuggestion")}</p>
                      <p className="text-lg text-primary">{suggestion.newListName}</p>
                    </div>
                  </div>
                ) : suggestion.suggestedListName ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t("suggestedList")}</p>
                      <p className="text-lg text-primary">{suggestion.suggestedListName}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("noSuitableCategory")}</p>
                )}
              </div>

              {/* 置信度 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("confidence")}</span>
                <span className={confidenceColor}>{confidencePercent}%</span>
              </div>

              {/* 理由 */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("reason")}</p>
                <p className="text-sm">{suggestion.reason}</p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          {suggestion && (suggestion.suggestedListId || suggestion.suggestNewList) && (
            <Button onClick={handleApply} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("applying")}
                </>
              ) : suggestion.suggestNewList ? (
                t("createAndApply")
              ) : (
                t("apply")
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
