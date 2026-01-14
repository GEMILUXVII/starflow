"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-blockquote-alert";
import rehypeRaw from "rehype-raw";
import "remark-github-blockquote-alert/alert.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

interface ReadmeDialogProps {
  open: boolean;
  repositoryId: string | null;
  repositoryName: string;
  repositoryUrl: string;
  onOpenChange: (open: boolean) => void;
}

export function ReadmeDialog({
  open,
  repositoryId,
  repositoryName,
  repositoryUrl,
  onOpenChange,
}: ReadmeDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && repositoryId) {
      setLoading(true);
      setError(null);
      setContent(null);

      fetch(`/api/repositories/${repositoryId}/readme`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else if (data.content === null) {
            setError(data.message || "此仓库没有 README 文件");
          } else {
            setContent(data.content);
          }
        })
        .catch((err) => {
          console.error("Failed to load README:", err);
          setError("加载失败，请重试");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, repositoryId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="truncate">{repositoryName}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                GitHub
              </a>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              {error}
            </div>
          ) : content ? (
            <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkGithubAlerts]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  img: ({ src, alt, width, height }) => {
                    // Handle relative image URLs
                    let imgSrc = src;
                    if (src && !src.startsWith("http") && !src.startsWith("data:")) {
                      const [owner, repo] = repositoryName.split("/");
                      imgSrc = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${src}`;
                    }
                    return (
                      <img
                        src={imgSrc}
                        alt={alt || ""}
                        width={width}
                        height={height}
                        style={{
                          ...(width || height ? { width, height } : {}),
                          maxWidth: '100%',
                          display: 'inline-block',
                          verticalAlign: 'middle',
                        }}
                        loading="lazy"
                      />
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="overflow-x-auto bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm text-zinc-800 dark:text-zinc-200">
                      {children}
                    </pre>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
