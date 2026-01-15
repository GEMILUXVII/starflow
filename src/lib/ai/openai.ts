import { AIProvider, AIConfig, RepoInfo, ListInfo, ClassifyResult } from "./types";

export class OpenAIAdapter implements AIProvider {
  name = "openai";
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  private buildPrompt(repo: RepoInfo, lists: ListInfo[]): string {
    const listsText = lists.length > 0
      ? lists.map((l, i) => `${i + 1}. ${l.name}`).join("\n")
      : "（暂无）";

    // 构建 README 摘要部分
    const readmeSection = repo.readmeSummary
      ? `\nREADME 摘要:\n${repo.readmeSummary}\n`
      : "";

    return `# 仓库分类任务

## 待分类仓库
名称: ${repo.fullName}
描述: ${repo.description || "（无描述）"}
语言: ${repo.language || "未知"}
Topics: ${repo.topics.length > 0 ? repo.topics.join(", ") : "（无）"}${readmeSection}

## 用户现有 Lists
${listsText}

## 分类指南

**核心原则：根据仓库的实际功能分类，不是技术栈！**

常见分类映射：
- proxy/clash/v2ray/翻墙/科学上网 → 代理工具
- AI/LLM/GPT/Claude/机器学习 → AI工具
- server/docker/k8s/运维/监控 → 运维/DevOps
- vim/neovim/editor/IDE → 编辑器
- cli/terminal/命令行 → CLI工具
- database/数据库/redis/mysql → 数据库

**决策流程：**
1. 先从仓库名称、描述、README 中识别核心功能
2. 匹配现有 List（>60% 相关就用现有的）
3. 无匹配才建新 List（名称 ≤12字符）

## 输出（仅 JSON）
{
  "listName": "现有 List 名称或 null",
  "suggestNewList": false,
  "newListName": "新名称（如代理工具、AI助手）",
  "confidence": 0.8,
  "reason": "核心功能 + 分类依据"
}`;
  }

  async classify(repo: RepoInfo, lists: ListInfo[]): Promise<ClassifyResult> {
    // 移除末尾的斜杠
    const baseUrl = (this.config.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = this.config.model || "gpt-3.5-turbo";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: this.buildPrompt(repo, lists),
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        throw new Error(`AI API 返回了 HTML 页面，请检查 API 端点配置是否正确`);
      }
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`AI API 返回了非 JSON 响应，请检查 API 端点配置`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty response");
    }

    // 解析 JSON 响应
    let parsed;
    try {
      // 尝试提取 JSON（处理可能的 markdown 包装）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      throw new Error(`Failed to parse AI response: ${content}`);
    }

    // 查找匹配的 List ID
    let suggestedListId: string | null = null;
    let suggestedListName: string | null = null;

    if (parsed.listName && !parsed.suggestNewList) {
      const matchedList = lists.find(
        (l) => l.name.toLowerCase() === parsed.listName.toLowerCase()
      );
      if (matchedList) {
        suggestedListId = matchedList.id;
        suggestedListName = matchedList.name;
      }
    }

    // 如果新 List 名称过长，截断处理
    let newListName = parsed.newListName;
    if (newListName && newListName.length > 15) {
      // 尝试取第一个词或截断
      const words = newListName.split(/[\s&,]+/);
      newListName = words[0].slice(0, 15);
    }

    return {
      suggestedListId,
      suggestedListName,
      suggestNewList: parsed.suggestNewList || false,
      newListName,
      confidence: parsed.confidence || 0.5,
      reason: parsed.reason || "AI 建议",
    };
  }

  async testConnection(): Promise<boolean> {
    // 移除末尾的斜杠
    const baseUrl = (this.config.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = this.config.model || "gpt-3.5-turbo";

    try {
      // 使用简单的 chat 请求测试，因为有些代理不支持 /models 端点
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export function createAIProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case "openai":
    case "ollama":
      // Ollama 也兼容 OpenAI API 格式
      return new OpenAIAdapter(config);
    default:
      return new OpenAIAdapter(config);
  }
}
