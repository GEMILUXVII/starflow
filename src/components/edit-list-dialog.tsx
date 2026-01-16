"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LIST_COLORS } from "@/lib/colors";

interface List {
  id: string;
  name: string;
  color: string;
}

interface EditListDialogProps {
  open: boolean;
  list: List | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
}

export function EditListDialog({
  open,
  list,
  onOpenChange,
  onSubmit,
  onDelete,
}: EditListDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(LIST_COLORS[11]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when list changes
  useEffect(() => {
    if (list) {
      setName(list.name);
      setColor(list.color);
    }
    setShowDeleteConfirm(false);
  }, [list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !list) return;

    setLoading(true);
    try {
      await onSubmit(list.id, name.trim(), color);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!list) return;
    setLoading(true);
    try {
      await onDelete(list.id);
    } finally {
      setLoading(false);
    }
  };

  if (!list) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        {showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>
                确定要删除 List "{list.name}" 吗？此操作不可撤销，但不会影响仓库的 Star 状态。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "删除中..." : "确认删除"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>编辑 List</DialogTitle>
              <DialogDescription>
                修改 List 的名称或颜色
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">名称</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：前端工具"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label>颜色</Label>
                <div className="flex gap-2 flex-wrap">
                  {LIST_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="sm:mr-auto"
              >
                删除
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={!name.trim() || loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
