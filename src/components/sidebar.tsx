"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Code,
} from "lucide-react";

interface SidebarProps {
  lists: Array<{
    id: string;
    name: string;
    color: string;
    count: number;
  }>;
  languages: Array<{
    name: string;
    count: number;
  }>;
  totalStars: number;
  uncategorizedCount: number;
  selectedList?: string;
  selectedLanguage?: string;
  onCreateList?: () => void;
}

export function Sidebar({
  lists,
  languages,
  totalStars,
  uncategorizedCount,
  selectedList,
  selectedLanguage,
  onCreateList,
}: SidebarProps) {
  const pathname = usePathname();
  const [listsExpanded, setListsExpanded] = useState(true);
  const [languagesExpanded, setLanguagesExpanded] = useState(true);

  return (
    <aside className="w-64 border-r bg-muted/10 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 全部 Stars */}
          <div className="space-y-1">
            <Link href="/stars">
              <Button
                variant={!selectedList && !selectedLanguage ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Star className="mr-2 h-4 w-4" />
                全部 Stars
                <Badge variant="secondary" className="ml-auto">
                  {totalStars}
                </Badge>
              </Button>
            </Link>
            <Link href="/stars?list=uncategorized">
              <Button
                variant={selectedList === "uncategorized" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                未分类
                <Badge variant="secondary" className="ml-auto">
                  {uncategorizedCount}
                </Badge>
              </Button>
            </Link>
          </div>

          {/* Lists */}
          <div>
            <button
              onClick={() => setListsExpanded(!listsExpanded)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground w-full"
            >
              {listsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Lists
            </button>
            {listsExpanded && (
              <div className="mt-2 space-y-1">
                {lists.map((list) => (
                  <Link key={list.id} href={`/stars?list=${list.id}`}>
                    <Button
                      variant={selectedList === list.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: list.color }}
                      />
                      <span className="truncate">{list.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {list.count}
                      </Badge>
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={onCreateList}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  新建 List
                </Button>
              </div>
            )}
          </div>

          {/* Languages */}
          <div>
            <button
              onClick={() => setLanguagesExpanded(!languagesExpanded)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground w-full"
            >
              {languagesExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              语言
            </button>
            {languagesExpanded && (
              <div className="mt-2 space-y-1">
                {languages.slice(0, 10).map((lang) => (
                  <Link key={lang.name} href={`/stars?language=${encodeURIComponent(lang.name)}`}>
                    <Button
                      variant={selectedLanguage === lang.name ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Code className="mr-2 h-4 w-4" />
                      <span className="truncate">{lang.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {lang.count}
                      </Badge>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
