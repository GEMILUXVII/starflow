"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Pencil, Eye } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load note when dialog opens
  useEffect(() => {
    if (open && repositoryId) {
      setLoading(true);
      setIsEditing(false);
      fetch(`/api/notes/${repositoryId}`)
        .then((res) => res.json())
        .then((data) => {
          const noteContent = data.content || "";
          setContent(noteContent);
          setOriginalContent(noteContent);
          setLastSaved(data.updatedAt);
          // If no note exists, start in edit mode
          if (!noteContent) {
            setIsEditing(true);
          }
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
        setOriginalContent(content);
        setIsEditing(false);
        onSaved?.();
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!repositoryId) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!repositoryId) return;
    setShowDeleteConfirm(false);
    setSaving(true);
    try {
      await fetch(`/api/notes/${repositoryId}`, {
        method: "DELETE",
      });
      setContent("");
      setOriginalContent("");
      setLastSaved(null);
      setIsEditing(true);
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalContent) {
      setContent(originalContent);
      setIsEditing(false);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[70vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>笔记</DialogTitle>
            {!loading && originalContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    预览
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-1" />
                    编辑
                  </>
                )}
              </Button>
            )}
          </div>
          <DialogDescription className="truncate">
            {repositoryName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isEditing ? (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="添加你的笔记... 支持 Markdown 格式"
              className="flex-1 resize-none"
            />
            {lastSaved && (
              <p className="text-xs text-muted-foreground flex-shrink-0">
                上次保存：{new Date(lastSaved).toLocaleString("zh-CN")}
              </p>
            )}
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <article className="prose prose-sm dark:prose-invert max-w-none px-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
            {lastSaved && (
              <p className="text-xs text-muted-foreground mt-4">
                上次保存：{new Date(lastSaved).toLocaleString("zh-CN")}
              </p>
            )}
          </ScrollArea>
        )}

        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2">
          {isEditing ? (
            <>
              {originalContent && (
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
                onClick={handleCancel}
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
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="删除笔记"
        description="确定要删除这条笔记吗？此操作不可恢复。"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </Dialog>
  );
}
