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
import { LIST_COLORS } from "@/lib/colors";

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
  requestInterval?: number;
  concurrency?: number;
}

export function BatchClassifyDialog({
  open,
  onOpenChange,
  uncategorizedRepos,
  existingLists,
  onComplete,
  requestInterval = 1000,
  concurrency = 3,
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

  // 批量处理（并行，带间隔）
  const startProcessing = async () => {
    setPhase("processing");
    setProgress(0);
    setResults([]);
    abortRef.current = false;

    const allResults: ClassifyResult[] = [];
    const queue = [...uncategorizedRepos];
    let activeCount = 0;
    let completedCount = 0;

    const processNext = async (): Promise<void> => {
      if (abortRef.current || queue.length === 0) return;

      const repo = queue.shift()!;
      activeCount++;
      setCurrentRepo(`${repo.fullName} (+${activeCount - 1} 并行)`);

      const result = await classifyRepo(repo);
      allResults.push(result);
      completedCount++;
      activeCount--;

      setResults([...allResults]);
      setProgress(Math.round((completedCount / totalRepos) * 100));

      // 间隔后处理下一个
      if (queue.length > 0 && !abortRef.current) {
        await delay(requestInterval);
        await processNext();
      }
    };

    // 启动并行任务
    const workers = Array(Math.min(concurrency, queue.length))
      .fill(null)
      .map(() => processNext());

    await Promise.all(workers);

    // 处理完成，分析结果
    processResults(allResults);
  };

  // 标准分类列表（与 openai.ts 保持一致）
  const STANDARD_CATEGORIES = [
    "AI工具",
    "代理工具",
    "CLI工具",
    "前端",
    "后端",
    "数据库",
    "DevOps",
    "编辑器",
    "开发工具",
    "下载工具",
    "媒体工具",
    "安全工具",
    "学习资源",
    "系统工具",
    "其他",
  ];

  // 强制映射到标准分类
  const normalizeListName = (name: string): string => {
    const lowerName = name.toLowerCase();

    // 首先检查是否已经是标准分类
    for (const cat of STANDARD_CATEGORIES) {
      if (cat === name || cat.toLowerCase() === lowerName) {
        return cat;
      }
    }

    // 关键词映射到标准分类
    const rules: [RegExp, string][] = [
      // 代理工具（优先匹配）
      [/proxy|代理|clash|v2ray|sing-box|翻墙|科学上网|vpn|ss|ssr|trojan|shadowsocks|hysteria|xray|网络代理/i, "代理工具"],
      // AI
      [/\bai\b|llm|gpt|claude|ollama|机器学习|深度学习|ml\b|人工智能|chatbot|copilot|neural|transformer/i, "AI工具"],
      // DevOps
      [/devops|docker|k8s|kubernetes|ansible|terraform|ci\/cd|运维|部署|容器|helm|jenkins|github.?action/i, "DevOps"],
      // 编辑器
      [/editor|编辑器|vim|neovim|vscode|ide|emacs|sublime|编辑/i, "编辑器"],
      // CLI
      [/\bcli\b|terminal|shell|命令行|console|bash|zsh|终端/i, "CLI工具"],
      // 前端
      [/frontend|前端|react|vue|angular|svelte|next\.?js|nuxt|tailwind|css|html|webpack|vite|组件/i, "前端"],
      // 后端
      [/backend|后端|server|服务端|express|fastapi|gin|spring|nestjs|graphql|api/i, "后端"],
      // 数据库
      [/database|数据库|db\b|redis|mysql|postgres|sqlite|mongo|orm|prisma/i, "数据库"],
      // 安全
      [/security|安全|加密|crypto|auth|password|密码|oauth|jwt/i, "安全工具"],
      // 下载
      [/download|下载|aria2|youtube-dl|yt-dlp|torrent/i, "下载工具"],
      // 媒体
      [/media|视频|音频|图片|image|video|audio|ffmpeg|图像|音乐|播放/i, "媒体工具"],
      // 学习资源
      [/learn|学习|tutorial|教程|awesome|资源|course|书籍|book|文档|doc/i, "学习资源"],
      // 系统工具
      [/system|系统|windows|linux|mac|os|桌面|desktop|launcher/i, "系统工具"],
      // 开发工具（兜底）
      [/dev|tool|工具|utility|lib|library|framework|sdk/i, "开发工具"],
    ];

    for (const [pattern, category] of rules) {
      if (pattern.test(lowerName) || pattern.test(name)) {
        return category;
      }
    }

    // 完全无法匹配，归入"其他"
    return "其他";
  };

  // 检查新 List 名称是否与现有 List 相似
  const findSimilarExistingList = (newName: string): { id: string; name: string } | null => {
    const normalizedNew = newName.toLowerCase();

    for (const list of existingLists) {
      const normalizedExisting = list.name.toLowerCase();

      // 完全匹配
      if (normalizedNew === normalizedExisting) {
        return list;
      }

      // 包含关系匹配
      if (normalizedNew.includes(normalizedExisting) || normalizedExisting.includes(normalizedNew)) {
        return list;
      }

      // 关键词匹配
      const keywords = [
        ["ai", "人工智能", "机器学习", "llm"],
        ["proxy", "代理", "翻墙", "科学上网", "vpn"],
        ["devops", "运维", "docker", "k8s", "容器"],
        ["cli", "命令行", "终端", "terminal"],
        ["前端", "frontend", "react", "vue"],
        ["后端", "backend", "server", "api"],
        ["数据库", "database", "db"],
        ["安全", "security", "加密"],
        ["测试", "test"],
        ["文档", "doc", "markdown"],
        ["编辑器", "editor", "vim", "ide"],
      ];

      for (const group of keywords) {
        const newMatches = group.some(k => normalizedNew.includes(k));
        const existingMatches = group.some(k => normalizedExisting.includes(k));
        if (newMatches && existingMatches) {
          return list;
        }
      }
    }

    return null;
  };

  // 分析结果，分离已匹配和新 List 建议
  const processResults = async (allResults: ClassifyResult[]) => {
    const toApply: { repoId: string; listId: string }[] = [];
    const newListMap = new Map<string, { id: string; name: string }[]>();

    for (const result of allResults) {
      // 分类失败的仓库也要收集起来
      if (!result.success || !result.suggestion) {
        const fallbackName = "待分类";
        if (!newListMap.has(fallbackName)) {
          newListMap.set(fallbackName, []);
        }
        newListMap.get(fallbackName)!.push({
          id: result.repoId,
          name: result.repoName,
        });
        continue;
      }

      const { suggestion } = result;

      if (suggestion.suggestedListId && !suggestion.suggestNewList) {
        // 匹配到现有 List，直接添加
        toApply.push({
          repoId: result.repoId,
          listId: suggestion.suggestedListId,
        });
      } else if (suggestion.suggestNewList && suggestion.newListName) {
        // 建议新 List - 先检查是否有相似的现有 List
        const similarList = findSimilarExistingList(suggestion.newListName);
        if (similarList) {
          // 找到相似的现有 List，直接归入
          toApply.push({
            repoId: result.repoId,
            listId: similarList.id,
          });
        } else {
          // 没有相似的，归一化名称后收集
          const normalizedName = normalizeListName(suggestion.newListName);
          if (!newListMap.has(normalizedName)) {
            newListMap.set(normalizedName, []);
          }
          newListMap.get(normalizedName)!.push({
            id: result.repoId,
            name: result.repoName,
          });
        }
      } else {
        // 兜底：AI 没有给出有效建议时，归入"其他"类别
        // 这包括：suggestNewList 为 true 但 newListName 为空，
        // 或者 suggestedListId 为 null 且 suggestNewList 为 false 的情况
        const fallbackName = "其他";
        if (!newListMap.has(fallbackName)) {
          newListMap.set(fallbackName, []);
        }
        newListMap.get(fallbackName)!.push({
          id: result.repoId,
          name: result.repoName,
        });
      }
    }

    // 自动应用匹配到现有 List 的
    for (const { repoId, listId } of toApply) {
      try {
        const res = await fetch(`/api/lists/${listId}/repositories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryId: repoId }),
        });
        if (!res.ok) {
          console.error("Failed to add to list:", await res.text());
        }
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

    let colorIndex = 0;
    for (const suggestion of newListSuggestions) {
      if (!suggestion.selected) continue;

      try {
        // 创建新 List - 使用预定义颜色
        const color = LIST_COLORS[colorIndex % LIST_COLORS.length];
        colorIndex++;
        const res = await fetch("/api/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: suggestion.name, color }),
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
                <li>• 预计耗时：约 {Math.ceil(totalRepos / concurrency * (requestInterval / 1000 + 2) / 60)} 分钟（{concurrency} 并发）</li>
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
                    className="mt-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FolderPlus className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium">{suggestion.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({suggestion.repos.length} 个仓库)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.repos.slice(0, 5).map((r) => r.name).join(", ")}
                      {suggestion.repos.length > 5 && ` 等 ${suggestion.repos.length} 个`}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-2">
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
