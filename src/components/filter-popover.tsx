"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Filters {
  minStars?: number;
  maxStars?: number;
  hasNotes?: boolean;
  isArchived?: "true" | "false" | undefined;
}

interface FilterPopoverProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterPopover({ filters, onFiltersChange }: FilterPopoverProps) {
  const t = useTranslations("filter");
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const emptyFilters: Filters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setOpen(false);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-1" />
          {t("title")}
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="font-medium">{t("advancedFilter")}</div>

          {/* Star 数量范围 */}
          <div className="space-y-2">
            <Label>{t("starCount")}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={t("min")}
                value={localFilters.minStars || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    minStars: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-24"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder={t("max")}
                value={localFilters.maxStars || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    maxStars: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-24"
              />
            </div>
          </div>

          {/* 是否有笔记 */}
          <div className="space-y-2">
            <Label>{t("notes")}</Label>
            <Select
              value={localFilters.hasNotes === true ? "true" : "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  hasNotes: value === "true" ? true : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="true">{t("hasNotes")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 是否归档 */}
          <div className="space-y-2">
            <Label>{t("archived")}</Label>
            <Select
              value={localFilters.isArchived || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  isArchived: value === "all" ? undefined : (value as "true" | "false"),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("archivedAll")}</SelectItem>
                <SelectItem value="false">{t("notArchived")}</SelectItem>
                <SelectItem value="true">{t("archivedOnly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 按钮 */}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              {t("reset")}
            </Button>
            <Button size="sm" onClick={handleApply}>
              {t("apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
