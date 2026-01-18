"use client";

import { formatDistanceToNow } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  GitFork,
  ExternalLink,
  MoreHorizontal,
  FolderPlus,
  Trash2,
  FileText,
  Archive,
  BookOpen,
  Sparkles,
} from "lucide-react";

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
  lists?: Array<{ id: string; name: string; color: string }>;
}

interface RepositoryCardProps {
  repository: Repository;
  lists: Array<{ id: string; name: string; color: string }>;
  onAddToList?: (repoId: string, listId: string) => void;
  onRemoveFromList?: (repoId: string, listId: string) => void;
  onUnstar?: (repoId: string) => void;
  onOpenNote?: (repoId: string) => void;
  onOpenReadme?: (repoId: string) => void;
  onAiClassify?: (repoId: string) => void;
  aiEnabled?: boolean;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (repoId: string) => void;
  compact?: boolean;
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
};

export function RepositoryCard({
  repository,
  lists,
  onAddToList,
  onRemoveFromList,
  onUnstar,
  onOpenNote,
  onOpenReadme,
  onAiClassify,
  aiEnabled,
  selectMode,
  selected,
  onToggleSelect,
  compact,
}: RepositoryCardProps) {
  const t = useTranslations("repository");
  const locale = useLocale();
  const repoLists = repository.lists || [];
  const availableLists = lists.filter(
    (l) => !repoLists.some((rl) => rl.id === l.id)
  );

  return (
    <Card
      className={`hover:shadow-md transition-shadow flex flex-col h-full ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={selectMode ? () => onToggleSelect?.(repository.id) : undefined}
    >
      <CardContent className={compact ? "p-3 flex-1" : "p-4 flex-1"}>
        <div className="flex items-start justify-between gap-4">
          {/* Checkbox for select mode */}
          {selectMode && (
            <div className="flex items-center pt-1">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect?.(repository.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {/* Repo Name */}
            <div className="flex items-center gap-2">
              <a
                href={repository.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline truncate"
              >
                {repository.fullName}
              </a>
              {repository.isArchived && (
                <Badge variant="outline" className="text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  Archived
                </Badge>
              )}
            </div>

            {/* Description */}
            {!compact && repository.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {repository.description}
              </p>
            )}

            {/* Meta Info */}
            <div className={`flex items-center gap-4 ${compact ? "mt-1" : "mt-3"} text-sm text-muted-foreground`}>
              {repository.language && (
                <div className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        languageColors[repository.language] || "#858585",
                    }}
                  />
                  <span>{repository.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{repository.stargazersCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                <span>{repository.forksCount.toLocaleString()}</span>
              </div>
              {repository.pushedAt && (
                <span>
                  {t("updatedAgo", {
                    time: formatDistanceToNow(new Date(repository.pushedAt), {
                      addSuffix: false,
                      locale: locale === "zh" ? zhCN : enUS,
                    })
                  })}
                </span>
              )}
            </div>

            {/* Lists */}
            {repoLists.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {repoLists.map((list) => (
                  <Badge
                    key={list.id}
                    variant="secondary"
                    className="text-xs group/badge cursor-default px-1.5 border"
                    style={{ borderColor: list.color }}
                  >
                    <span className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                        style={{ backgroundColor: list.color }}
                      />
                      {list.name}
                      <span
                        className="ml-1 w-2 flex-shrink-0 text-center opacity-0 group-hover/badge:opacity-100 hover:text-destructive transition-opacity cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromList?.(repository.id, list.id);
                        }}
                        title={t("removeFromThisList")}
                      >
                        ×
                      </span>
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="self-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a
                  href={repository.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("viewOnGithub")}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenReadme?.(repository.id)}>
                <BookOpen className="mr-2 h-4 w-4" />
                {t("viewReadme")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenNote?.(repository.id)}>
                <FileText className="mr-2 h-4 w-4" />
                {t("note")}
              </DropdownMenuItem>
              {availableLists.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {t("addToList")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {availableLists.map((list) => (
                      <DropdownMenuItem
                        key={list.id}
                        onClick={() => onAddToList?.(repository.id, list.id)}
                      >
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: list.color }}
                        />
                        {list.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {aiEnabled && (
                <DropdownMenuItem onClick={() => onAiClassify?.(repository.id)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("aiClassify")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onUnstar?.(repository.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("unstar")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
