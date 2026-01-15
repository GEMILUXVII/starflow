"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AlertMessage } from "@/components/alert-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Loader2,
  ArrowLeft,
  Settings2,
  Github,
  Trash2,
  Keyboard,
  Info,
  Sparkles,
} from "lucide-react";
import { getPreferences, setPreferences, UserPreferences } from "@/lib/preferences";
import { Input } from "@/components/ui/input";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
}

export function SettingsClient({ user }: { user: User }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [preferences, setPrefs] = useState<UserPreferences>({
    defaultSort: "starredAt",
    itemsPerPage: 50,
    compactView: false,
  });
  const [clearing, setClearing] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [alertMessage, setAlertMessage] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant?: "default" | "success" | "error";
  }>({
    open: false,
    title: "",
    message: "",
  });

  // AI 配置状态
  const [aiConfig, setAiConfig] = useState({
    provider: "openai",
    apiKey: "",
    baseUrl: "",
    model: "gpt-3.5-turbo",
    enabled: false,
    hasApiKey: false,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);

  useEffect(() => {
    setPrefs(getPreferences());
    fetchAiConfig();
  }, []);

  const fetchAiConfig = async () => {
    try {
      const res = await fetch("/api/ai/config");
      if (res.ok) {
        const data = await res.json();
        setAiConfig((prev) => ({
          ...prev,
          provider: data.provider || "openai",
          baseUrl: data.baseUrl || "",
          model: data.model || "gpt-3.5-turbo",
          enabled: data.enabled || false,
          hasApiKey: data.hasApiKey || false,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch AI config:", error);
    }
  };

  const handleSaveAiConfig = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey || undefined,
          baseUrl: aiConfig.baseUrl || undefined,
          model: aiConfig.model,
          enabled: aiConfig.enabled,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiConfig((prev) => ({
          ...prev,
          apiKey: "",
          hasApiKey: data.hasApiKey,
        }));
        setAlertMessage({
          open: true,
          title: "保存成功",
          message: "AI 配置已保存",
          variant: "success",
        });
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Save AI config error:", error);
      setAlertMessage({
        open: true,
        title: "保存失败",
        message: "保存 AI 配置失败",
        variant: "error",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleTestAiConnection = async () => {
    setAiTesting(true);
    try {
      const res = await fetch("/api/ai/test", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setAlertMessage({
          open: true,
          title: "连接成功",
          message: "AI 服务连接正常",
          variant: "success",
        });
      } else {
        setAlertMessage({
          open: true,
          title: "连接失败",
          message: data.error || "无法连接到 AI 服务",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Test AI connection error:", error);
      setAlertMessage({
        open: true,
        title: "测试失败",
        message: "测试连接时发生错误",
        variant: "error",
      });
    } finally {
      setAiTesting(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updated = { ...preferences, [key]: value };
    setPrefs(updated);
    setPreferences({ [key]: value });
  };

  const handleExport = async (format: "json" | "csv") => {
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `starflow-export-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      setAlertMessage({
        open: true,
        title: "导出失败",
        message: "导出失败，请重试",
        variant: "error",
      });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setImportResult({
          success: true,
          message: `导入成功！创建 ${result.results.listsCreated} 个 List，更新 ${result.results.reposUpdated} 个仓库，导入 ${result.results.notesCreated} 条笔记。${result.results.listsSkipped > 0 ? ` (跳过 ${result.results.listsSkipped} 个已存在的 List)` : ""}`,
        });
      } else {
        setImportResult({
          success: false,
          message: result.error || "导入失败",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResult({
        success: false,
        message: "导入失败，请确保文件格式正确",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearNotes = async () => {
    setConfirmDialog({
      open: true,
      title: "清除所有笔记",
      description: "确定要删除所有笔记吗？此操作不可恢复。",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, open: false });
        setClearing("notes");
        try {
          await fetch("/api/notes", { method: "DELETE" });
          router.refresh();
          setAlertMessage({
            open: true,
            title: "操作成功",
            message: "所有笔记已删除",
            variant: "success",
          });
        } catch (error) {
          console.error("Clear notes error:", error);
          setAlertMessage({
            open: true,
            title: "操作失败",
            message: "删除失败，请重试",
            variant: "error",
          });
        } finally {
          setClearing(null);
        }
      },
    });
  };

  const handleClearLists = async () => {
    setConfirmDialog({
      open: true,
      title: "清除所有 Lists",
      description: "确定要删除所有 Lists 吗？此操作不可恢复。",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, open: false });
        setClearing("lists");
        try {
          await fetch("/api/lists/all", { method: "DELETE" });
          router.refresh();
          setAlertMessage({
            open: true,
            title: "操作成功",
            message: "所有 Lists 已删除",
            variant: "success",
          });
        } catch (error) {
          console.error("Clear lists error:", error);
          setAlertMessage({
            open: true,
            title: "操作失败",
            message: "删除失败，请重试",
            variant: "error",
          });
        } finally {
          setClearing(null);
        }
      },
    });
  };

  const handleResetData = async () => {
    setConfirmDialog({
      open: true,
      title: "重置所有数据",
      description: "确定要重置所有数据吗？这将删除所有 Lists、笔记，并重新从 GitHub 同步。此操作不可恢复。",
      variant: "destructive",
      onConfirm: () => {
        setConfirmDialog({
          open: true,
          title: "再次确认",
          description: "所有本地数据将被清除，是否继续？",
          variant: "destructive",
          onConfirm: async () => {
            setConfirmDialog({ ...confirmDialog, open: false });
            setClearing("reset");
            try {
              await fetch("/api/reset", { method: "POST" });
              setAlertMessage({
                open: true,
                title: "操作成功",
                message: "数据已重置，即将刷新页面",
                variant: "success",
              });
              setTimeout(() => {
                router.push("/stars");
              }, 1500);
            } catch (error) {
              console.error("Reset error:", error);
              setAlertMessage({
                open: true,
                title: "操作失败",
                message: "重置失败，请重试",
                variant: "error",
              });
            } finally {
              setClearing(null);
            }
          },
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8 mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/stars")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        <h1 className="text-2xl font-bold mb-6">设置</h1>

        {/* Display Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              显示偏好
            </CardTitle>
            <CardDescription>
              自定义仓库列表的显示方式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>默认排序</Label>
                <p className="text-sm text-muted-foreground">新打开页面时的默认排序方式</p>
              </div>
              <Select
                value={preferences.defaultSort}
                onValueChange={(value) => updatePreference("defaultSort", value as UserPreferences["defaultSort"])}
              >
                <SelectTrigger className="w-36">
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

            <div className="flex items-center justify-between">
              <div>
                <Label>每页显示数量</Label>
                <p className="text-sm text-muted-foreground">每次加载的仓库数量</p>
              </div>
              <Select
                value={preferences.itemsPerPage.toString()}
                onValueChange={(value) => updatePreference("itemsPerPage", parseInt(value))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>紧凑视图</Label>
                <p className="text-sm text-muted-foreground">使用更紧凑的卡片布局</p>
              </div>
              <Switch
                checked={preferences.compactView}
                onCheckedChange={(checked) => updatePreference("compactView", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* GitHub Account */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub 账户
            </CardTitle>
            <CardDescription>
              当前连接的 GitHub 账户信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{user.username || user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              导出数据
            </CardTitle>
            <CardDescription>
              导出你的 Stars、Lists 和笔记数据
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleExport("json")}
              className="flex-1"
            >
              <FileJson className="mr-2 h-4 w-4" />
              导出 JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              className="flex-1"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              导出 CSV
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              导入数据
            </CardTitle>
            <CardDescription>
              从 JSON 备份文件导入 Lists 和笔记（仅导入已 Star 的仓库的数据）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  选择 JSON 文件导入
                </>
              )}
            </Button>

            {importResult && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  importResult.success
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {importResult.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              数据管理
            </CardTitle>
            <CardDescription>
              清除或重置本地数据
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">清除所有笔记</p>
                <p className="text-sm text-muted-foreground">删除所有仓库笔记</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearNotes}
                disabled={clearing !== null}
              >
                {clearing === "notes" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "清除"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">清除所有 Lists</p>
                <p className="text-sm text-muted-foreground">删除所有分类列表</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLists}
                disabled={clearing !== null}
              >
                {clearing === "lists" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "清除"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium text-destructive">重置所有数据</p>
                <p className="text-sm text-muted-foreground">清除所有本地数据并重新同步</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetData}
                disabled={clearing !== null}
              >
                {clearing === "reset" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "重置"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI 智能分类
            </CardTitle>
            <CardDescription>
              配置 AI 服务，自动为仓库推荐分类
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>启用 AI 分类</Label>
                <p className="text-sm text-muted-foreground">开启后可使用 AI 自动分类功能</p>
              </div>
              <Switch
                checked={aiConfig.enabled}
                onCheckedChange={(checked) =>
                  setAiConfig((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>AI 服务商</Label>
              <Select
                value={aiConfig.provider}
                onValueChange={(value) =>
                  setAiConfig((prev) => ({ ...prev, provider: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI / 兼容 API</SelectItem>
                  <SelectItem value="ollama">Ollama (本地)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                支持 OpenAI、Azure、各类代理服务 (one-api 等)
              </p>
            </div>

            <div className="space-y-2">
              <Label>API 端点 (可选)</Label>
              <Input
                type="url"
                placeholder={aiConfig.provider === "ollama" ? "http://localhost:11434/v1" : "https://api.openai.com/v1"}
                value={aiConfig.baseUrl}
                onChange={(e) =>
                  setAiConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                留空使用默认端点，或填写代理/自建服务地址
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Key {aiConfig.hasApiKey && <span className="text-green-600">(已配置)</span>}</Label>
              <Input
                type="password"
                placeholder={aiConfig.hasApiKey ? "••••••••" : "sk-..."}
                value={aiConfig.apiKey}
                onChange={(e) =>
                  setAiConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>模型</Label>
              <Input
                type="text"
                placeholder="gpt-3.5-turbo"
                value={aiConfig.model}
                onChange={(e) =>
                  setAiConfig((prev) => ({ ...prev, model: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                推荐：gpt-3.5-turbo (便宜) 或 gpt-4o-mini (更准确)
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveAiConfig}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存配置"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestAiConnection}
                disabled={aiTesting || !aiConfig.hasApiKey}
              >
                {aiTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    测试中...
                  </>
                ) : (
                  "测试连接"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              键盘快捷键
            </CardTitle>
            <CardDescription>
              可用的键盘快捷键
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">聚焦搜索框</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">同步仓库</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">r</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">切换主题</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">t</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">返回顶部</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">g g</kbd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              关于
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">版本</span>
                <span>1.2.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">开源协议</span>
                <span>MIT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">项目地址</span>
                <a
                  href="https://github.com/GEMILUXVII/starflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />

      <AlertMessage
        open={alertMessage.open}
        onOpenChange={(open) => setAlertMessage({ ...alertMessage, open })}
        title={alertMessage.title}
        message={alertMessage.message}
        variant={alertMessage.variant}
      />
    </div>
  );
}
