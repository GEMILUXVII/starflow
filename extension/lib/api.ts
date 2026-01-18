export const STARFLOW_API = 'http://localhost:3000/api';

export interface StarflowList {
  id: string;
  name: string;
  color: string;
  description?: string;
  count: number;
}

export interface StarflowRepo {
  id: string; // userRepositoryId
  githubId: number;
  fullName: string;
  lists: StarflowList[];
}

// Message Types
export type ApiMessage =
  | { type: 'IS_AUTHENTICATED' }
  | { type: 'GET_LISTS' }
  | { type: 'GET_REPO_STATUS'; payload: { fullName: string } }
  | { type: 'ADD_TO_LIST'; payload: { repoId: string; listId: string } }
  | { type: 'REMOVE_FROM_LIST'; payload: { repoId: string; listId: string } }
  | { type: 'SYNC_STARS' }
  | { type: 'CLASSIFY_REPO'; payload: { repositoryId: string } }
  | { type: 'GET_NOTE'; payload: { repositoryId: string } }
  | { type: 'SAVE_NOTE'; payload: { repositoryId: string; content: string } };

// Helper to send message to background script
async function sendMessage<T>(message: ApiMessage): Promise<T> {
  try {
    const response = await browser.runtime.sendMessage(message);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  } catch (error) {
    console.error(`Message ${message.type} failed:`, error);
    throw error;
  }
}

export const starflowApi = {
  // Check if user is authenticated
  async isAuthenticated() {
    return sendMessage<boolean>({ type: 'IS_AUTHENTICATED' });
  },

  // Get user lists
  async getLists() {
    return sendMessage<StarflowList[]>({ type: 'GET_LISTS' });
  },

  // Check if a repo is starred/tracked by Starflow
  async getRepoStatus(fullName: string) {
    return sendMessage<StarflowRepo | null>({ type: 'GET_REPO_STATUS', payload: { fullName } });
  },

  // Add repo to a list
  async addToList(repoId: string, listId: string) {
    return sendMessage<any>({ type: 'ADD_TO_LIST', payload: { repoId, listId } });
  },

  // Remove repo from a list
  async removeFromList(repoId: string, listId: string) {
    return sendMessage<any>({ type: 'REMOVE_FROM_LIST', payload: { repoId, listId } });
  },

  // Trigger Sync
  async syncStars() {
    return sendMessage<any>({ type: 'SYNC_STARS' });
  },

  // AI Classify
  async classifyRepo(repositoryId: string) {
    return sendMessage<{
      suggestion: {
        primary: string;   // List Name
        confidence: number;
        reasoning: string;
      }
    }>({ type: 'CLASSIFY_REPO', payload: { repositoryId } });
  },

  // Get Note
  async getNote(repositoryId: string) {
    return sendMessage<{ content: string; updatedAt: string | null }>({
      type: 'GET_NOTE',
      payload: { repositoryId }
    });
  },

  // Save Note
  async saveNote(repositoryId: string, content: string) {
    return sendMessage<{ content: string; updatedAt: string }>({
      type: 'SAVE_NOTE',
      payload: { repositoryId, content }
    });
  }
};
