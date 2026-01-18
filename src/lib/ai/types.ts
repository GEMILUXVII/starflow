export interface RepoInfo {
  id: string;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  language: string | null;
  topics: string[];
  readmeSummary?: string | null; // README 摘要
}

export interface ListInfo {
  id: string;
  name: string;
  description: string | null;
}

export interface ClassifyResult {
  suggestedListId: string | null;
  suggestedListName: string | null;
  suggestNewList: boolean;
  newListName?: string;
  confidence: number;
  reason: string;
}

export interface ClassifyOptions {
  locale?: string; // 用户语言偏好 'zh' | 'en'
}

export interface AIProvider {
  name: string;
  classify(repo: RepoInfo, lists: ListInfo[], options?: ClassifyOptions): Promise<ClassifyResult>;
  testConnection(): Promise<boolean>;
}

export interface AIConfig {
  provider: string;
  apiKey: string | null;
  baseUrl: string | null;
  model: string;
}
