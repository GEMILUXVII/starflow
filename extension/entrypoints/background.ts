import { STARFLOW_API, type ApiMessage } from '../lib/api';

export default defineBackground(() => {
  console.log('Starflow background service worker started');

  browser.runtime.onMessage.addListener((message: ApiMessage, sender, sendResponse) => {
    handleMessage(message)
      .then((data) => sendResponse({ data }))
      .catch((error) => sendResponse({ error: error.message }));

    // Return true to indicate we will send a response asynchronously
    return true;
  });
});

async function handleMessage(message: ApiMessage) {
  switch (message.type) {
    case 'IS_AUTHENTICATED':
      try {
        const res = await fetch(`${STARFLOW_API}/lists`, { credentials: 'include' });
        return res.ok;
      } catch (e) {
        return false;
      }

    case 'GET_LISTS': {
      const res = await fetch(`${STARFLOW_API}/lists`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch lists');
      return res.json();
    }

    case 'GET_REPO_STATUS': {
      const { fullName } = message.payload;
      const res = await fetch(`${STARFLOW_API}/repositories?search=${encodeURIComponent(fullName)}&limit=1`, {
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      // Precise match check
      const repo = data.repositories.find((r: any) => r.fullName === fullName);
      return repo || null;
    }

    case 'ADD_TO_LIST': {
      const { listId, repoId } = message.payload;
      const res = await fetch(`${STARFLOW_API}/lists/${listId}/repositories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ repositoryId: repoId })
      });
      if (!res.ok) throw new Error('Failed to add to list');
      return res.json();
    }

    case 'REMOVE_FROM_LIST': {
      const { listId, repoId } = message.payload;
      const res = await fetch(`${STARFLOW_API}/lists/${listId}/repositories/${repoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to remove from list');
      return res.json();
    }

    case 'SYNC_STARS': {
      const res = await fetch(`${STARFLOW_API}/repositories/sync`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to sync stars');
      return res.json();
    }

    case 'CLASSIFY_REPO': {
      const { repositoryId } = message.payload;
      const res = await fetch(`${STARFLOW_API}/ai/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ repositoryId })
      });
      if (!res.ok) throw new Error('Failed to classify repository');
      return res.json();
    }

    case 'GET_NOTE': {
      const { repositoryId } = message.payload;
      const res = await fetch(`${STARFLOW_API}/notes/${repositoryId}`, {
        credentials: 'include'
      });
      if (res.status === 404) return { content: '', updatedAt: null };
      if (!res.ok) throw new Error('Failed to fetch note');
      return res.json();
    }

    case 'SAVE_NOTE': {
      const { repositoryId, content } = message.payload;
      const res = await fetch(`${STARFLOW_API}/notes/${repositoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to save note');
      return res.json();
    }

    default:
      throw new Error('Unknown message type');
  }
}
