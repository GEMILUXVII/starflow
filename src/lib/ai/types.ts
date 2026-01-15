export interface RepoInfo {
  id: string;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  language: string | null;
  topics: string[];
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

export interface AIProvider {
  name: string;
  classify(repo: RepoInfo, lists: ListInfo[]): Promise<ClassifyResult>;
  testConnection(): Promise<boolean>;
}

export interface AIConfig {
  provider: string;
  apiKey: string | null;
  baseUrl: string | null;
  model: string;
}
