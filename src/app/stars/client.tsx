"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { RepositoryCard } from "@/components/repository-card";
import { CreateListDialog } from "@/components/create-list-dialog";
import { EditListDialog } from "@/components/edit-list-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
}

export function StarsClient({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("starredAt");
  const [showCreateList, setShowCreateList] = useState(false);
  const [editingList, setEditingList] = useState<{ id: string; name: string; color: string } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
      params.set("limit", "50");

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
  }, [selectedList, selectedLanguage, searchQuery, sortBy]);

  // 当筛选条件变化时，重置并重新加载
  useEffect(() => {
    setPage(1);
    setRepositories([]);
    setHasMore(true);
    fetchRepositories(1, false);
  }, [fetchRepositories]);

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

  const handleAddToList = async (repoId: string, listId: string) => {
    try {
      await fetch(`/api/lists/${listId}/repositories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId: repoId }),
      });
      await fetchRepositories(1, false);
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
      await fetchRepositories(1, false);
      await fetchStats();
    } catch (error) {
      console.error("Failed to remove from list:", error);
    }
  };

  const handleUnstar = async (repoId: string) => {
    if (!confirm("确定要取消 Star 吗？此操作将同步到 GitHub。")) return;
    try {
      await fetch(`/api/repositories/${repoId}/star`, { method: "DELETE" });
      await fetchRepositories(1, false);
      await fetchStats();
    } catch (error) {
      console.error("Failed to unstar:", error);
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

  return (
    <div className="h-screen flex flex-col">
      <Header
        user={user}
        onSync={handleSync}
        isSyncing={isSyncing}
        onSearch={setSearchQuery}
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
        <main className="flex-1 overflow-auto p-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">
              {selectedList
                ? stats?.lists.find((l) => l.id === selectedList)?.name
                : selectedLanguage
                  ? selectedLanguage
                  : "全部 Stars"}
              {total > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({repositories.length} / {total})
                </span>
              )}
            </h1>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starredAt">Star 时间</SelectItem>
                <SelectItem value="stargazersCount">Stars 数量</SelectItem>
                <SelectItem value="pushedAt">最近更新</SelectItem>
                <SelectItem value="name">名称</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Repository List */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : repositories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>暂无仓库</p>
                <Button variant="outline" className="mt-4" onClick={handleSync}>
                  同步 GitHub Stars
                </Button>
              </div>
            ) : (
              <>
                {repositories.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repository={repo}
                    lists={stats?.lists || []}
                    onAddToList={handleAddToList}
                    onRemoveFromList={handleRemoveFromList}
                    onUnstar={handleUnstar}
                  />
                ))}

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
                          加载中...
                        </>
                      ) : (
                        `加载更多 (${repositories.length} / ${total})`
                      )}
                    </Button>
                  </div>
                )}

                {!hasMore && repositories.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    已加载全部 {total} 个仓库
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

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
    </div>
  );
}
