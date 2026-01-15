import { AIProvider, AIConfig, RepoInfo, ListInfo, ClassifyResult } from "./types";

export class OpenAIAdapter implements AIProvider {
  name = "openai";
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  private buildPrompt(repo: RepoInfo, lists: ListInfo[]): string {
    const listsText = lists.length > 0
      ? lists.map((l, i) => `${i + 1}. ${l.name}${l.description ? ` - ${l.description}` : ""}`).join("\n")
      : "（用户还没有创建任何 List）";

    return `你是一个 GitHub 仓库分类助手。请根据仓库信息，建议将其归入哪个 List。

用户现有的 Lists：
${listsText}

需要分类的仓库：
- 名称: ${repo.fullName}
- 描述: ${repo.description || "无"}
- 语言: ${repo.language || "未知"}
- Topics: ${repo.topics.length > 0 ? repo.topics.join(", ") : "无"}

请分析这个仓库，返回 JSON 格式的建议：
{
  "listName": "建议的 List 名称（必须是上面列表中存在的，如果没有合适的则为 null）",
  "suggestNewList": false,
  "newListName": "如果建议创建新 List，填写名称",
  "confidence": 0.85,
  "reason": "简短说明分类理由"
}

注意：
1. 如果现有 List 中有合适的，优先使用现有 List
2. 只有在确实没有合适的 List 时，才建议创建新 List
3. confidence 范围 0-1，表示你对这个分类的确信程度
4. 只返回 JSON，不要其他内容`;
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

    return {
      suggestedListId,
      suggestedListName,
      suggestNewList: parsed.suggestNewList || false,
      newListName: parsed.newListName,
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
