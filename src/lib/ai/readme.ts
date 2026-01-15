/**
 * README 获取和摘要提取工具
 */

interface ReadmeResult {
  content: string;
  summary: string;
}

/**
 * 从 GitHub 获取仓库 README
 */
export async function fetchReadme(
  owner: string,
  repo: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // README 内容是 base64 编码的
    if (data.content) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return content;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch README:", error);
    return null;
  }
}

/**
 * 从 README 内容中提取摘要
 * - 跳过 badge (![...](...)
 * - 跳过 HTML 标签
 * - 跳过纯链接行
 * - 提取前 500 字符有效内容
 */
export function extractReadmeSummary(content: string, maxLength: number = 500): string {
  if (!content) return "";

  let text = content;

  // 1. 移除 HTML 标签
  text = text.replace(/<[^>]+>/g, "");

  // 2. 移除 badge 图片 ![alt](url)
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

  // 3. 移除普通图片链接
  text = text.replace(/\[[^\]]*\]\([^)]+\)/g, (match) => {
    // 保留链接文字，去掉 URL
    const textMatch = match.match(/\[([^\]]*)\]/);
    return textMatch ? textMatch[1] : "";
  });

  // 4. 移除代码块
  text = text.replace(/```[\s\S]*?```/g, "[代码块]");
  text = text.replace(/`[^`]+`/g, "");

  // 5. 移除 HTML 注释
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // 6. 移除连续空行，标准化空白
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");

  // 7. 移除目录（Table of Contents）部分
  text = text.replace(/#{1,3}\s*(table of contents|目录|toc)[\s\S]*?(?=\n#{1,2}\s|\n\n\n|$)/gi, "");

  // 8. 移除纯链接行和空标题
  const lines = text.split("\n").filter((line) => {
    const trimmed = line.trim();
    // 跳过空行
    if (!trimmed) return false;
    // 跳过只有 # 的行
    if (/^#+\s*$/.test(trimmed)) return false;
    // 跳过分隔线
    if (/^[-=]{3,}$/.test(trimmed)) return false;
    // 跳过纯装饰行
    if (/^[*_-]{3,}$/.test(trimmed)) return false;
    return true;
  });

  text = lines.join("\n").trim();

  // 9. 提取前 maxLength 字符
  if (text.length > maxLength) {
    // 尝试在句子或段落边界截断
    let cutoff = text.lastIndexOf("。", maxLength);
    if (cutoff < maxLength * 0.5) {
      cutoff = text.lastIndexOf(". ", maxLength);
    }
    if (cutoff < maxLength * 0.5) {
      cutoff = text.lastIndexOf("\n", maxLength);
    }
    if (cutoff < maxLength * 0.5) {
      cutoff = maxLength;
    }
    text = text.slice(0, cutoff).trim() + "...";
  }

  return text;
}

/**
 * 获取并处理 README 摘要
 */
export async function getReadmeSummary(
  owner: string,
  repo: string,
  accessToken: string
): Promise<string | null> {
  const content = await fetchReadme(owner, repo, accessToken);
  if (!content) return null;

  const summary = extractReadmeSummary(content);
  return summary || null;
}
