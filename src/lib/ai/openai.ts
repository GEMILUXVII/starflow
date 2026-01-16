import { AIProvider, AIConfig, RepoInfo, ListInfo, ClassifyResult } from "./types";

export class OpenAIAdapter implements AIProvider {
  name = "openai";
  private config: AIConfig;

  // 预定义的标准分类（限制在 15 个以内）
  static readonly STANDARD_CATEGORIES = [
    "AI工具",
    "代理工具",
    "CLI工具",
    "前端",
    "后端",
    "数据库",
    "DevOps",
    "编辑器",
    "开发工具",
    "下载工具",
    "媒体工具",
    "安全工具",
    "学习资源",
    "系统工具",
    "其他",
  ];

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

    // 标准分类列表
    const standardCategories = OpenAIAdapter.STANDARD_CATEGORIES.join("、");

    return `# 仓库分类任务

## 待分类仓库
名称: ${repo.fullName}
描述: ${repo.description || "（无描述）"}
语言: ${repo.language || "未知"}
Topics: ${repo.topics.length > 0 ? repo.topics.join(", ") : "（无）"}${readmeSection}

## 用户现有 Lists
${listsText}

## 标准分类（必须从以下选择）
${standardCategories}

## 分类规则（严格遵守）

1. **优先匹配现有 List**：如果用户已有相关 List，必须使用现有 List
2. **否则使用标准分类**：从上面的标准分类中选择最合适的
3. **禁止创建新分类名称**：只能使用现有 List 名称或标准分类名称

关键词对应：
- proxy/clash/v2ray/vpn/翻墙 → 代理工具
- AI/LLM/GPT/机器学习/chatbot → AI工具
- docker/k8s/CI/CD/部署 → DevOps
- vim/vscode/IDE/编辑 → 编辑器
- cli/terminal/命令行 → CLI工具
- react/vue/前端/css/html → 前端
- express/fastapi/后端/api → 后端
- database/redis/mysql → 数据库
- download/下载/aria2 → 下载工具
- video/audio/图片/媒体 → 媒体工具
- security/加密/密码 → 安全工具
- 教程/学习/awesome → 学习资源
- 系统/windows/linux/mac → 系统工具
- 通用开发工具 → 开发工具
- 无法分类 → 其他

## 输出（仅 JSON）
{
  "listName": "现有 List 名称（精确匹配）或 null",
  "suggestNewList": true,
  "newListName": "标准分类名称（必须从上面选择）",
  "confidence": 0.8,
  "reason": "一句话"
}`;
  }

  // 规范化 baseUrl，自动补全 /v1
  private normalizeBaseUrl(): string {
    let baseUrl = (this.config.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");

    // 如果用户填写了完整路径（包含 /chat/completions），去掉它
    if (baseUrl.endsWith("/chat/completions")) {
      baseUrl = baseUrl.replace(/\/chat\/completions$/, "");
    }

    // 如果不以 /v1 结尾，自动补上（兼容用户只填域名的情况）
    if (!baseUrl.endsWith("/v1")) {
      baseUrl = `${baseUrl}/v1`;
    }
    return baseUrl;
  }

  async classify(repo: RepoInfo, lists: ListInfo[]): Promise<ClassifyResult> {
    const baseUrl = this.normalizeBaseUrl();
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
    const baseUrl = this.normalizeBaseUrl();
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
