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

## 分类规则

**必须给出分类！不允许返回空结果。**

分类映射参考：
- proxy/clash/v2ray/翻墙 → 代理工具
- AI/LLM/GPT/Claude → AI工具
- docker/k8s/运维 → DevOps
- vim/neovim/editor → 编辑器
- cli/terminal → CLI工具
- database/redis/mysql → 数据库
- react/vue/frontend → 前端
- go/rust/python/java → 按功能分类，不按语言

**决策：**
1. 优先匹配现有 List
2. 无匹配则必须建议新 List（名称 ≤10字符，如：代理工具、AI助手）

## 输出（仅 JSON，必填所有字段）
{
  "listName": "匹配的现有 List 名称，无匹配填 null",
  "suggestNewList": true,
  "newListName": "新 List 名称（必填，如无匹配现有 List）",
  "confidence": 0.8,
  "reason": "一句话说明"
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
        max_tokens: 10000, // 足够空间返回完整 JSON
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

    // 检查是否被截断
    const finishReason = data.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      throw new Error("AI 响应被截断，请稍后重试");
    }

    if (!content) {
      throw new Error("AI returned empty response");
    }

    // 解析 JSON 响应
    let parsed;
    try {
      // 尝试提取 JSON（处理可能的 markdown 包装）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // 尝试修复不完整的 JSON
        let jsonStr = jsonMatch[0];

        // 如果 JSON 不完整，尝试补全
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          // 尝试截断到最后一个完整的字段
          const lastComma = jsonStr.lastIndexOf(",");
          const lastColon = jsonStr.lastIndexOf(":");
          if (lastComma > lastColon) {
            jsonStr = jsonStr.substring(0, lastComma) + "}";
          } else {
            throw new Error("JSON 不完整");
          }
        }

        parsed = JSON.parse(jsonStr);
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
