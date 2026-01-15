"use client";

import { useState } from "react";
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
            AI 分类建议
          </DialogTitle>
          <DialogDescription className="truncate">
            {repositoryName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">AI 正在分析...</p>
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
                      <p className="font-medium">建议创建新 List</p>
                      <p className="text-lg text-primary">{suggestion.newListName}</p>
                    </div>
                  </div>
                ) : suggestion.suggestedListName ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">建议添加到</p>
                      <p className="text-lg text-primary">{suggestion.suggestedListName}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">未找到合适的分类</p>
                )}
              </div>

              {/* 置信度 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">置信度</span>
                <span className={confidenceColor}>{confidencePercent}%</span>
              </div>

              {/* 理由 */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">分类理由</p>
                <p className="text-sm">{suggestion.reason}</p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          {suggestion && (suggestion.suggestedListId || suggestion.suggestNewList) && (
            <Button onClick={handleApply} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  应用中...
                </>
              ) : suggestion.suggestNewList ? (
                "创建并应用"
              ) : (
                "应用分类"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
