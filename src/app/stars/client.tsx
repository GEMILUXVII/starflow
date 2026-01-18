"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { RepositoryCard } from "@/components/repository-card";
import { CreateListDialog } from "@/components/create-list-dialog";
import { EditListDialog } from "@/components/edit-list-dialog";
import { NoteDialog } from "@/components/note-dialog";
import { ReadmeDialog } from "@/components/readme-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AiClassifyDialog } from "@/components/ai-classify-dialog";
import { BatchClassifyDialog } from "@/components/batch-classify-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FolderPlus, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterPopover, Filters } from "@/components/filter-popover";
import { getPreferences, UserPreferences } from "@/lib/preferences";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Footer } from "@/components/footer";
import { getRandomColor } from "@/lib/colors";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
}

interface Repository {
  id: string;
  githubId: number;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  isArchived: boolean;
  htmlUrl: string;
  pushedAt: string | null;
  starredAt: string;
  lists: Array<{ id: string; name: string; color: string }>;
}

interface List {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface Stats {
  totalStars: number;
  uncategorizedCount: number;
  languages: Array<{ name: string; count: number }>;
  lists: List[];
  lastSyncAt: string | null;
}

export function StarsClient({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const t = useTranslations("stars");
  const tConfirm = useTranslations("confirm");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("starredAt");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [compactView, setCompactView] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [editingList, setEditingList] = useState<{ id: string; name: string; color: string } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [noteRepo, setNoteRepo] = useState<{ id: string; name: string } | null>(null);
  const [readmeRepo, setReadmeRepo] = useState<{ id: string; name: string; url: string } | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // AI 分类状态
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiClassifyRepo, setAiClassifyRepo] = useState<{ id: string; name: string } | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    suggestedListId: string | null;
    suggestedListName: string | null;
    suggestNewList: boolean;
    newListName?: string;
    confidence: number;
    reason: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 批量分类状态
  const [showBatchClassify, setShowBatchClassify] = useState(false);
  const [uncategorizedRepos, setUncategorizedRepos] = useState<{ id: string; fullName: string }[]>([]);
  const [aiRequestInterval, setAiRequestInterval] = useState(1000);
  const [aiConcurrency, setAiConcurrency] = useState(3);

  // Load preferences on mount
  useEffect(() => {
    const prefs = getPreferences();
    setSortBy(prefs.defaultSort);
    setItemsPerPage(prefs.itemsPerPage);
    setCompactView(prefs.compactView);
    setPrefsLoaded(true);

    // 检查 AI 是否启用
    fetch("/api/ai/config")
      .then((res) => res.json())
      .then((data) => {
        setAiEnabled(data.enabled && data.hasApiKey);
        setAiRequestInterval(data.requestInterval || 1000);
        setAiConcurrency(data.concurrency || 3);
      })
      .catch(() => setAiEnabled(false));
  }, []);

  const selectedList = searchParams.get("list") || undefined;
  const selectedLanguage = searchParams.get("language") || undefined;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchRepositories = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (selectedList) params.set("listId", selectedList);
      if (selectedLanguage) params.set("language", selectedLanguage);
      if (searchQuery) params.set("search", searchQuery);
      params.set("sort", sortBy);
      params.set("page", pageNum.toString());
      params.set("limit", itemsPerPage.toString());

      // Add advanced filters
      if (filters.minStars) params.set("minStars", filters.minStars.toString());
      if (filters.maxStars) params.set("maxStars", filters.maxStars.toString());
      if (filters.hasNotes) params.set("hasNotes", "true");
      if (filters.isArchived) params.set("isArchived", filters.isArchived);

      const res = await fetch(`/api/repositories?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setRepositories(prev => [...prev, ...data.repositories]);
        } else {
          setRepositories(data.repositories);
        }
        setTotal(data.pagination.total);
        setHasMore(pageNum < data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedList, selectedLanguage, searchQuery, sortBy, filters, itemsPerPage]);

  // 当筛选条件变化时，重置并重新加载
  useEffect(() => {
    if (!prefsLoaded) return;
    setPage(1);
    setRepositories([]);
    setHasMore(true);
    fetchRepositories(1, false);
  }, [fetchRepositories, prefsLoaded]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/repositories/sync", { method: "POST" });
      if (res.ok) {
        await fetchStats();
        await fetchRepositories(1, false);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSync: handleSync,
    searchInputRef,
    scrollContainerRef,
  });

  const handleAddToList = async (repoId: string, listId: string) => {
    try {
      await fetch(`/api/lists/${listId}/repositories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId: repoId }),
      });
      // 本地更新，避免重新获取导致回到顶部
      const targetList = stats?.lists.find((l) => l.id === listId);
      if (targetList) {
        setRepositories((prev) =>
          prev.map((repo) =>
            repo.id === repoId
              ? { ...repo, lists: [...repo.lists, { id: targetList.id, name: targetList.name, color: targetList.color }] }
              : repo
          )
        );
      }
      // 只更新侧边栏统计
      await fetchStats();
    } catch (error) {
      console.error("Failed to add to list:", error);
    }
  };

  const handleRemoveFromList = async (repoId: string, listId: string) => {
    try {
      await fetch(`/api/lists/${listId}/repositories/${repoId}`, {
        method: "DELETE",
      });
      // 本地更新，避免重新获取导致回到顶部
      setRepositories((prev) =>
        prev.map((repo) =>
          repo.id === repoId
            ? { ...repo, lists: repo.lists.filter((l) => l.id !== listId) }
            : repo
        )
      );
      // 只更新侧边栏统计
      await fetchStats();
    } catch (error) {
      console.error("Failed to remove from list:", error);
    }
  };

  const handleUnstar = async (repoId: string) => {
    setConfirmDialog({
      open: true,
      title: tConfirm("unstar.title"),
      description: tConfirm("unstar.description"),
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          await fetch(`/api/repositories/${repoId}/star`, { method: "DELETE" });
          await fetchRepositories(1, false);
          await fetchStats();
        } catch (error) {
          console.error("Failed to unstar:", error);
        }
      },
    });
  };

  // 批量操作
  const handleToggleSelect = (repoId: string) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedRepos.size === repositories.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(repositories.map((r) => r.id)));
    }
  };

  const handleBatchUnstar = async () => {
    if (selectedRepos.size === 0) return;
    setConfirmDialog({
      open: true,
      title: tConfirm("batchUnstar.title"),
      description: tConfirm("batchUnstar.description", { count: selectedRepos.size }),
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          // 逐个取消 Star
          for (const repoId of selectedRepos) {
            await fetch(`/api/repositories/${repoId}/star`, { method: "DELETE" });
          }
          setSelectedRepos(new Set());
          setSelectMode(false);
          await fetchRepositories(1, false);
          await fetchStats();
        } catch (error) {
          console.error("Failed to batch unstar:", error);
        }
      },
    });
  };

  const handleExitSelectMode = () => {
    setSelectMode(false);
    setSelectedRepos(new Set());
  };

  // AI 分类功能
  const handleAiClassify = async (repoId: string) => {
    const repo = repositories.find((r) => r.id === repoId);
    if (!repo) return;

    setAiClassifyRepo({ id: repoId, name: repo.fullName });
    setAiSuggestion(null);
    setAiError(null);
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId: repoId }),
      });

      const data = await res.json();

      if (res.ok) {
        setAiSuggestion(data.suggestion);
      } else {
        setAiError(data.error || "AI classification failed");
      }
    } catch (error) {
      console.error("AI classify error:", error);
      setAiError("AI classification request failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiApply = async (listId: string) => {
    if (!aiClassifyRepo) return;
    await handleAddToList(aiClassifyRepo.id, listId);
  };

  const handleAiCreateAndApply = async (listName: string) => {
    if (!aiClassifyRepo) return;

    try {
      // 创建新 List（使用预定义颜色）
      const color = getRandomColor();
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName, color }),
      });

      if (res.ok) {
        const newList = await res.json();
        await handleAddToList(aiClassifyRepo.id, newList.id);
        await fetchStats();
      }
    } catch (error) {
      console.error("Create list error:", error);
    }
  };

  const handleBatchAddToList = async (listId: string) => {
    if (selectedRepos.size === 0) return;

    try {
      for (const repoId of selectedRepos) {
        await fetch(`/api/lists/${listId}/repositories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryId: repoId }),
        });
      }
      setSelectedRepos(new Set());
      setSelectMode(false);
      await fetchRepositories(1, false);
      await fetchStats();
    } catch (error) {
      console.error("Failed to batch add to list:", error);
    }
  };

  const handleOpenNote = (repoId: string) => {
    const repo = repositories.find((r) => r.id === repoId);
    if (repo) {
      setNoteRepo({ id: repo.id, name: repo.fullName });
    }
  };

  const handleOpenReadme = (repoId: string) => {
    const repo = repositories.find((r) => r.id === repoId);
    if (repo) {
      setReadmeRepo({ id: repo.id, name: repo.fullName, url: repo.htmlUrl });
    }
  };

  const handleCreateList = async (name: string, color: string) => {
    try {
      await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      await fetchStats();
      setShowCreateList(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  const handleEditList = async (id: string, name: string, color: string) => {
    try {
      await fetch(`/api/lists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      await fetchStats();
      await fetchRepositories(1, false);
      setEditingList(null);
    } catch (error) {
      console.error("Failed to update list:", error);
    }
  };

  const handleDeleteList = async (id: string) => {
    try {
      await fetch(`/api/lists/${id}`, {
        method: "DELETE",
      });
      await fetchStats();
      await fetchRepositories(1, false);
      setEditingList(null);
    } catch (error) {
      console.error("Failed to delete list:", error);
    }
  };

  // 获取未分类仓库并打开批量分类对话框
  const handleOpenBatchClassify = async () => {
    try {
      const res = await fetch("/api/repositories?listId=uncategorized&limit=1000");
      if (res.ok) {
        const data = await res.json();
        setUncategorizedRepos(
          data.repositories.map((r: Repository) => ({
            id: r.id,
            fullName: r.fullName,
          }))
        );
        setShowBatchClassify(true);
      }
    } catch (error) {
      console.error("Failed to fetch uncategorized repos:", error);
    }
  };

  // 批量分类完成后刷新
  const handleBatchClassifyComplete = () => {
    fetchRepositories(1, false);
    fetchStats();
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        user={user}
        onSync={handleSync}
        isSyncing={isSyncing}
        onSearch={setSearchQuery}
        lastSyncAt={stats?.lastSyncAt}
        searchInputRef={searchInputRef}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          lists={stats?.lists || []}
          languages={stats?.languages || []}
          totalStars={stats?.totalStars || 0}
          uncategorizedCount={stats?.uncategorizedCount || 0}
          selectedList={selectedList}
          selectedLanguage={selectedLanguage}
          onCreateList={() => setShowCreateList(true)}
          onEditList={(list) => setEditingList(list)}
        />
        <main ref={scrollContainerRef} className="flex-1 overflow-auto p-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            {selectMode ? (
              <>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedRepos.size === repositories.length ? t("deselectAll") : t("selectAll")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("selected", { count: selectedRepos.size })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {stats?.lists && stats.lists.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={selectedRepos.size === 0}
                        >
                          <FolderPlus className="h-4 w-4 mr-1" />
                          {t("addToList")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {stats.lists.map((list) => (
                          <DropdownMenuItem
                            key={list.id}
                            onClick={() => handleBatchAddToList(list.id)}
                          >
                            <span
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: list.color }}
                            />
                            {list.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchUnstar}
                    disabled={selectedRepos.size === 0}
                  >
                    {t("batchUnstar", { count: selectedRepos.size })}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExitSelectMode}>
                    {t("exitSelect")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold">
                  {selectedList
                    ? stats?.lists.find((l) => l.id === selectedList)?.name
                    : selectedLanguage
                      ? selectedLanguage
                      : t("title")}
                  {total > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({repositories.length} / {total})
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-2">
                  {aiEnabled && stats && stats.uncategorizedCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenBatchClassify}
                    >
                      <Sparkles className="mr-1 h-4 w-4" />
                      {t("oneClickOrganize", { count: stats.uncategorizedCount })}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectMode(true)}
                    disabled={repositories.length === 0}
                  >
                    {t("batchActions")}
                  </Button>
                  <FilterPopover filters={filters} onFiltersChange={setFilters} />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starredAt">{t("sortBy.starredAt")}</SelectItem>
                      <SelectItem value="stargazersCount">{t("sortBy.stargazersCount")}</SelectItem>
                      <SelectItem value="pushedAt">{t("sortBy.pushedAt")}</SelectItem>
                      <SelectItem value="name">{t("sortBy.name")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Repository List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : repositories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("noRepos")}</p>
              <Button variant="outline" className="mt-4" onClick={handleSync}>
                {t("syncGithub")}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repositories.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repository={repo}
                    lists={stats?.lists || []}
                    onAddToList={handleAddToList}
                    onRemoveFromList={handleRemoveFromList}
                    onUnstar={handleUnstar}
                    onOpenNote={handleOpenNote}
                    onOpenReadme={handleOpenReadme}
                    onAiClassify={handleAiClassify}
                    aiEnabled={aiEnabled}
                    selectMode={selectMode}
                    selected={selectedRepos.has(repo.id)}
                    onToggleSelect={handleToggleSelect}
                    compact={compactView}
                  />
                ))}
              </div>

                {/* Load More */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={() => fetchRepositories(page + 1, true)}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("noRepos")}
                        </>
                      ) : (
                        t("loadMore", { current: repositories.length, total })
                      )}
                    </Button>
                  </div>
                )}

                {!hasMore && repositories.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {t("loadedAll", { total })}
                  </div>
                )}
              </>
            )}
        </main>
      </div>

      <Footer />

      <CreateListDialog
        open={showCreateList}
        onOpenChange={setShowCreateList}
        onSubmit={handleCreateList}
      />

      <EditListDialog
        open={!!editingList}
        list={editingList}
        onOpenChange={(open) => !open && setEditingList(null)}
        onSubmit={handleEditList}
        onDelete={handleDeleteList}
      />

      <NoteDialog
        open={!!noteRepo}
        repositoryId={noteRepo?.id || null}
        repositoryName={noteRepo?.name || ""}
        onOpenChange={(open) => !open && setNoteRepo(null)}
      />

      <ReadmeDialog
        open={!!readmeRepo}
        repositoryId={readmeRepo?.id || null}
        repositoryName={readmeRepo?.name || ""}
        repositoryUrl={readmeRepo?.url || ""}
        onOpenChange={(open) => !open && setReadmeRepo(null)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />

      <AiClassifyDialog
        open={!!aiClassifyRepo}
        onOpenChange={(open) => !open && setAiClassifyRepo(null)}
        repositoryName={aiClassifyRepo?.name || ""}
        suggestion={aiSuggestion}
        loading={aiLoading}
        error={aiError}
        onApply={handleAiApply}
        onCreateAndApply={handleAiCreateAndApply}
      />

      <BatchClassifyDialog
        open={showBatchClassify}
        onOpenChange={setShowBatchClassify}
        uncategorizedRepos={uncategorizedRepos}
        existingLists={stats?.lists.map((l) => ({ id: l.id, name: l.name })) || []}
        onComplete={handleBatchClassifyComplete}
        requestInterval={aiRequestInterval}
        concurrency={aiConcurrency}
      />
    </div>
  );
}
