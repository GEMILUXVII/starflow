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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface NoteDialogProps {
  open: boolean;
  repositoryId: string | null;
  repositoryName: string;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function NoteDialog({
  open,
  repositoryId,
  repositoryName,
  onOpenChange,
  onSaved,
}: NoteDialogProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load note when dialog opens
  useEffect(() => {
    if (open && repositoryId) {
      setLoading(true);
      fetch(`/api/notes/${repositoryId}`)
        .then((res) => res.json())
        .then((data) => {
          setContent(data.content || "");
          setLastSaved(data.updatedAt);
        })
        .catch((error) => {
          console.error("Failed to load note:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, repositoryId]);

  const handleSave = async () => {
    if (!repositoryId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${repositoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSaved(data.updatedAt);
        onSaved?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!repositoryId) return;
    if (!confirm("确定要删除这条笔记吗？")) return;

    setSaving(true);
    try {
      await fetch(`/api/notes/${repositoryId}`, {
        method: "DELETE",
      });
      setContent("");
      setLastSaved(null);
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>笔记</DialogTitle>
          <DialogDescription className="truncate">
            {repositoryName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="添加你的笔记... 支持 Markdown 格式"
              className="min-h-[200px] resize-none"
            />
            {lastSaved && (
              <p className="text-xs text-muted-foreground">
                上次保存：{new Date(lastSaved).toLocaleString("zh-CN")}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {content && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="sm:mr-auto"
            >
              删除
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
