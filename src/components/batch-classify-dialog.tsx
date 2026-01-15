"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Check, X, FolderPlus } from "lucide-react";

interface Repository {
  id: string;
  fullName: string;
}

interface ClassifyResult {
  repoId: string;
  repoName: string;
  success: boolean;
  error?: string;
  suggestion?: {
    suggestedListId: string | null;
    suggestedListName: string | null;
    suggestNewList: boolean;
    newListName?: string;
    confidence: number;
    reason: string;
  };
}

interface NewListSuggestion {
  name: string;
  repos: { id: string; name: string }[];
  selected: boolean;
}

interface BatchClassifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uncategorizedRepos: Repository[];
  existingLists: { id: string; name: string }[];
  onComplete: () => void;
}

export function BatchClassifyDialog({
  open,
  onOpenChange,
  uncategorizedRepos,
  existingLists,
  onComplete,
}: BatchClassifyDialogProps) {
  const [phase, setPhase] = useState<"confirm" | "processing" | "review" | "done">("confirm");
  const [progress, setProgress] = useState(0);
  const [currentRepo, setCurrentRepo] = useState("");
  const [results, setResults] = useState<ClassifyResult[]>([]);
  const [newListSuggestions, setNewListSuggestions] = useState<NewListSuggestion[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const abortRef = useRef(false);

  const totalRepos = uncategorizedRepos.length;

  // 重置状态
  const resetState = () => {
    setPhase("confirm");
    setProgress(0);
    setCurrentRepo("");
    setResults([]);
    setNewListSuggestions([]);
    setIsApplying(false);
    abortRef.current = false;
  };

  // 延迟函数
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 处理单个仓库（带重试）
  const classifyRepo = async (repo: Repository, retries = 3): Promise<ClassifyResult> => {
    try {
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId: repo.id }),
      });

      // 429 限流错误，等待后重试
      if (res.status === 429 && retries > 0) {
        const retryAfter = parseInt(res.headers.get("retry-after") || "30");
        const waitTime = Math.min(retryAfter * 1000, 60000); // 最多等 60 秒
        setCurrentRepo(`${repo.fullName} (等待 ${Math.ceil(waitTime / 1000)}s 后重试...)`);
        await delay(waitTime);
        return classifyRepo(repo, retries - 1);
      }

      if (!res.ok) {
        const data = await res.json();
        return {
          repoId: repo.id,
          repoName: repo.fullName,
          success: false,
          error: data.error || "分类失败",
        };
      }

      const data = await res.json();
      return {
        repoId: repo.id,
        repoName: repo.fullName,
        success: true,
        suggestion: data.suggestion,
      };
    } catch (error) {
      return {
        repoId: repo.id,
        repoName: repo.fullName,
        success: false,
        error: error instanceof Error ? error.message : "请求失败",
      };
    }
  };

  // 批量处理（串行，带间隔）
  const startProcessing = async () => {
    setPhase("processing");
    setProgress(0);
    setResults([]);
    abortRef.current = false;

    const allResults: ClassifyResult[] = [];
    const requestInterval = 2500; // 每个请求间隔 2.5 秒

    for (let i = 0; i < uncategorizedRepos.length; i++) {
      if (abortRef.current) break;

      const repo = uncategorizedRepos[i];
      setCurrentRepo(repo.fullName);

      const result = await classifyRepo(repo);
      allResults.push(result);
      setResults([...allResults]);
      setProgress(Math.round((allResults.length / totalRepos) * 100));

      // 请求间隔（最后一个不需要等待）
      if (i < uncategorizedRepos.length - 1 && !abortRef.current) {
        await delay(requestInterval);
      }
    }

    // 处理完成，分析结果
    processResults(allResults);
  };

  // 分析结果，分离已匹配和新 List 建议
  const processResults = async (allResults: ClassifyResult[]) => {
    const toApply: { repoId: string; listId: string }[] = [];
    const newListMap = new Map<string, { id: string; name: string }[]>();

    for (const result of allResults) {
      if (!result.success || !result.suggestion) continue;

      const { suggestion } = result;

      if (suggestion.suggestedListId && !suggestion.suggestNewList) {
        // 匹配到现有 List，直接添加
        toApply.push({
          repoId: result.repoId,
          listId: suggestion.suggestedListId,
        });
      } else if (suggestion.suggestNewList && suggestion.newListName) {
        // 建议新 List
        const listName = suggestion.newListName;
        if (!newListMap.has(listName)) {
          newListMap.set(listName, []);
        }
        newListMap.get(listName)!.push({
          id: result.repoId,
          name: result.repoName,
        });
      }
    }

    // 自动应用匹配到现有 List 的
    for (const { repoId, listId } of toApply) {
      try {
        await fetch(`/api/lists/${listId}/repositories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryId: repoId }),
        });
      } catch (error) {
        console.error("Failed to add to list:", error);
      }
    }

    // 整理新 List 建议
    const suggestions: NewListSuggestion[] = Array.from(newListMap.entries()).map(
      ([name, repos]) => ({
        name,
        repos,
        selected: true,
      })
    );

    setNewListSuggestions(suggestions);

    if (suggestions.length > 0) {
      setPhase("review");
    } else {
      setPhase("done");
    }
  };

  // 切换新 List 选中状态
  const toggleListSelection = (index: number) => {
    setNewListSuggestions((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // 应用选中的新 List
  const applyNewLists = async () => {
    setIsApplying(true);

    for (const suggestion of newListSuggestions) {
      if (!suggestion.selected) continue;

      try {
        // 创建新 List
        const randomColor = `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")}`;
        const res = await fetch("/api/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: suggestion.name, color: randomColor }),
        });

        if (res.ok) {
          const newList = await res.json();
          // 添加仓库到新 List
          for (const repo of suggestion.repos) {
            await fetch(`/api/lists/${newList.id}/repositories`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ repositoryId: repo.id }),
            });
          }
        }
      } catch (error) {
        console.error("Failed to create list:", error);
      }
    }

    setIsApplying(false);
    setPhase("done");
  };

  // 关闭对话框
  const handleClose = () => {
    if (phase === "processing") {
      abortRef.current = true;
    }
    resetState();
    onOpenChange(false);
    if (phase === "done" || phase === "review") {
      onComplete();
    }
  };

  // 统计
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  const appliedCount = results.filter(
    (r) => r.success && r.suggestion?.suggestedListId && !r.suggestion?.suggestNewList
  ).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI 一键整理
          </DialogTitle>
          <DialogDescription>
            {phase === "confirm" && `将对 ${totalRepos} 个未分类仓库进行 AI 智能分类`}
            {phase === "processing" && "正在处理中，请勿关闭窗口..."}
            {phase === "review" && "以下是 AI 建议创建的新 List，请确认"}
            {phase === "done" && "整理完成！"}
          </DialogDescription>
        </DialogHeader>

        {/* 确认阶段 */}
        {phase === "confirm" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>处理说明：</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• 仅处理未分类的仓库</li>
                <li>• 匹配现有 List 的会自动归类</li>
                <li>• 建议新 List 的会让您确认后创建</li>
                <li>• 预计耗时：约 {Math.ceil(totalRepos * 3 / 60)} 分钟（避免 API 限流）</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={startProcessing} disabled={totalRepos === 0}>
                <Sparkles className="mr-2 h-4 w-4" />
                开始整理
              </Button>
            </div>
          </div>
        )}

        {/* 处理阶段 */}
        {phase === "processing" && (
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {results.length} / {totalRepos}
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                正在处理: {currentRepo}
              </p>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => (abortRef.current = true)}>
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 审核新 List 阶段 */}
        {phase === "review" && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              已自动归类 {appliedCount} 个仓库到现有 List
            </div>
            <ScrollArea className="h-64 border rounded-lg p-2">
              {newListSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.name}
                  className="flex items-start gap-3 p-2 hover:bg-muted rounded"
                >
                  <Checkbox
                    checked={suggestion.selected}
                    onCheckedChange={() => toggleListSelection(index)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="h-4 w-4 text-primary" />
                      <span className="font-medium">{suggestion.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({suggestion.repos.length} 个仓库)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {suggestion.repos.map((r) => r.name).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPhase("done")}>
                跳过
              </Button>
              <Button onClick={applyNewLists} disabled={isApplying}>
                {isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    创建选中的 List
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 完成阶段 */}
        {phase === "done" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <span>成功分类: {successCount} 个仓库</span>
              </div>
              {failCount > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <X className="h-4 w-4" />
                  <span>分类失败: {failCount} 个</span>
                </div>
              )}
              {newListSuggestions.filter((s) => s.selected).length > 0 && (
                <div className="flex items-center gap-2 text-primary">
                  <FolderPlus className="h-4 w-4" />
                  <span>
                    新建 List: {newListSuggestions.filter((s) => s.selected).length} 个
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>完成</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
