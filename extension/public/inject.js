(function() {
  // ==========================================
  // 0. CSS Styles (Inlined)
  // ==========================================
  const style = document.createElement('style');
  style.textContent = `
    #starflow-btn-container .sf-dropdown {
      position: absolute;
      right: 0;
      margin-top: 8px;
      width: 280px;
      z-index: 100;
      background: var(--bgColor-default, var(--color-canvas-overlay, #fff));
      border: 1px solid var(--borderColor-default, var(--color-border-default, #d0d7de));
      border-radius: 6px;
      box-shadow: var(--shadow-floating-small, 0 8px 24px rgba(140,149,159,0.2));
      animation: sf-fade-in 0.15s ease-out;
    }
    @keyframes sf-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    #starflow-btn-container .sf-header {
      padding: 8px 12px;
      border-bottom: 1px solid var(--borderColor-muted, var(--color-border-muted, #d8dee4));
      font-weight: 600;
      font-size: 12px;
      color: var(--fgColor-default, var(--color-fg-default, #24292f));
    }

    #starflow-btn-container .sf-body {
      max-height: 300px;
      overflow-y: auto;
    }

    #starflow-btn-container .sf-section {
      padding: 8px;
      border-bottom: 1px solid var(--borderColor-muted, var(--color-border-muted, #d8dee4));
    }
    #starflow-btn-container .sf-section:last-child {
      border-bottom: none;
    }

    #starflow-btn-container .sf-list {
      list-style: none;
      margin: 0;
      padding: 4px 0;
    }

    #starflow-btn-container .sf-list-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 6px 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      color: var(--fgColor-default, var(--color-fg-default, #24292f));
      border-radius: 6px;
      text-align: left;
      gap: 8px;
    }
    #starflow-btn-container .sf-list-item:hover {
      background: var(--bgColor-neutral-muted, var(--color-action-list-item-default-hover-bg, rgba(208,215,222,0.32)));
    }
    #starflow-btn-container .sf-list-item.sf-suggested {
      background: var(--bgColor-accent-muted, rgba(9, 105, 218, 0.1));
    }

    #starflow-btn-container .sf-check {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--fgColor-accent, var(--color-accent-fg, #0969da));
    }

    #starflow-btn-container .sf-color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    #starflow-btn-container .sf-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #starflow-btn-container .sf-badge {
      font-size: 10px;
      padding: 0 6px;
      background: var(--bgColor-accent-muted, rgba(9, 105, 218, 0.1));
      color: var(--fgColor-accent, var(--color-accent-fg, #0969da));
      border-radius: 10px;
      font-weight: 500;
    }

    #starflow-btn-container .sf-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid var(--button-default-borderColor-rest, var(--color-btn-border, rgba(31,35,40,0.15)));
      background: var(--button-default-bgColor-rest, var(--color-btn-bg, #f6f8fa));
      color: var(--button-default-fgColor-rest, var(--color-btn-text, #24292f));
      cursor: pointer;
    }
    #starflow-btn-container .sf-btn:hover {
      background: var(--button-default-bgColor-hover, var(--color-btn-hover-bg, #f3f4f6));
      border-color: var(--button-default-borderColor-hover, var(--color-btn-hover-border, rgba(31,35,40,0.15)));
    }
    #starflow-btn-container .sf-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    #starflow-btn-container .sf-btn-primary {
      background: var(--button-primary-bgColor-rest, var(--color-btn-primary-bg, #1f883d));
      color: var(--button-primary-fgColor-rest, var(--color-btn-primary-text, #fff));
      border-color: var(--button-primary-borderColor-rest, rgba(31,35,40,0.15));
    }
    #starflow-btn-container .sf-btn-primary:hover {
      background: var(--button-primary-bgColor-hover, var(--color-btn-primary-hover-bg, #1a7f37));
    }

    #starflow-btn-container .sf-ai-result {
      padding: 8px;
      background: var(--bgColor-accent-muted, rgba(9, 105, 218, 0.1));
      border-radius: 6px;
      font-size: 12px;
    }
    #starflow-btn-container .sf-ai-result-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
      font-weight: 600;
      color: var(--fgColor-accent, var(--color-accent-fg, #0969da));
    }
    #starflow-btn-container .sf-ai-result-reason {
      color: var(--fgColor-muted, var(--color-fg-muted, #656d76));
      font-size: 11px;
      line-height: 1.4;
    }

    #starflow-btn-container .sf-footer {
      padding: 8px 12px;
      border-top: 1px solid var(--borderColor-muted, var(--color-border-muted, #d8dee4));
      text-align: right;
    }
    #starflow-btn-container .sf-footer a {
      font-size: 12px;
      color: var(--fgColor-muted, var(--color-fg-muted, #656d76));
      text-decoration: none;
    }
    #starflow-btn-container .sf-footer a:hover {
      color: var(--fgColor-accent, var(--color-accent-fg, #0969da));
      text-decoration: underline;
    }

    #starflow-btn-container .sf-note-area {
      margin-top: 8px;
    }
    #starflow-btn-container .sf-note-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    #starflow-btn-container .sf-note-textarea {
      width: 100%;
      padding: 8px;
      font-size: 12px;
      border: 1px solid var(--borderColor-default, var(--color-border-default, #d0d7de));
      border-radius: 6px;
      background: var(--bgColor-default, var(--color-canvas-default, #fff));
      color: var(--fgColor-default, var(--color-fg-default, #24292f));
      resize: vertical;
      min-height: 60px;
    }
    #starflow-btn-container .sf-note-textarea:focus {
      outline: none;
      border-color: var(--focus-outlineColor, var(--color-accent-emphasis, #0969da));
      box-shadow: inset 0 0 0 1px var(--focus-outlineColor, var(--color-accent-emphasis, #0969da));
    }
    #starflow-btn-container .sf-note-hint {
      font-size: 10px;
      color: var(--fgColor-muted, var(--color-fg-muted, #656d76));
      text-align: right;
      margin-top: 4px;
    }

    #starflow-btn-container .sf-link-btn {
      background: none;
      border: none;
      padding: 0;
      font-size: 12px;
      color: var(--fgColor-accent, var(--color-accent-fg, #0969da));
      cursor: pointer;
    }
    #starflow-btn-container .sf-link-btn:hover {
      text-decoration: underline;
    }

    #starflow-btn-container .sf-center {
      padding: 16px;
      text-align: center;
    }
    #starflow-btn-container .sf-muted {
      color: var(--fgColor-muted, var(--color-fg-muted, #656d76));
      font-size: 12px;
      margin-bottom: 12px;
    }

    #starflow-btn-container .sf-saved {
      color: var(--fgColor-success, var(--color-success-fg, #1a7f37));
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    #starflow-btn-container .sf-error {
      padding: 12px;
      text-align: center;
    }
    #starflow-btn-container .sf-error-msg {
      color: var(--fgColor-danger, var(--color-danger-fg, #cf222e));
      font-size: 12px;
      margin-bottom: 8px;
    }
    #starflow-btn-container .sf-error-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    #starflow-btn-container .sf-create-list {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--borderColor-muted, var(--color-border-muted, #d8dee4));
    }
    #starflow-btn-container .sf-create-input {
      flex: 1;
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid var(--borderColor-default, var(--color-border-default, #d0d7de));
      border-radius: 6px;
      background: var(--bgColor-default, var(--color-canvas-default, #fff));
      color: var(--fgColor-default, var(--color-fg-default, #24292f));
    }
    #starflow-btn-container .sf-create-input:focus {
      outline: none;
      border-color: var(--focus-outlineColor, var(--color-accent-emphasis, #0969da));
    }
    #starflow-btn-container .sf-create-input::placeholder {
      color: var(--fgColor-muted, var(--color-fg-muted, #656d76));
    }
    #starflow-btn-container .sf-btn-small {
      padding: 4px 8px;
      font-size: 11px;
    }
    #starflow-btn-container .sf-btn-add {
      padding: 4px 10px;
      background: var(--button-primary-bgColor-rest, var(--color-btn-primary-bg, #1f883d));
      color: var(--button-primary-fgColor-rest, var(--color-btn-primary-text, #fff));
      border-color: var(--button-primary-borderColor-rest, rgba(31,35,40,0.15));
    }
    #starflow-btn-container .sf-btn-add:hover {
      background: var(--button-primary-bgColor-hover, var(--color-btn-primary-hover-bg, #1a7f37));
    }
    #starflow-btn-container .sf-btn-add:disabled {
      opacity: 0.5;
    }

    #starflow-btn-container .sf-list-item.sf-loading {
      opacity: 0.6;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // ==========================================
  // 1. API Logic (Bundled inline)
  // ==========================================
  const DEFAULT_API_URL = '';
  const STORAGE_KEY = 'starflow_api_url';
  let starflowBaseUrl = DEFAULT_API_URL;

  // Load saved API URL from storage
  async function loadApiUrl() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        starflowBaseUrl = result[STORAGE_KEY] || DEFAULT_API_URL;
      }
    } catch (e) {
      console.log('Starflow: Using default API URL');
    }
  }
  loadApiUrl();

  let extensionInvalidated = false;

  function handleExtensionInvalidated() {
    if (extensionInvalidated) return;
    extensionInvalidated = true;
    console.log('Starflow: Extension context invalidated, cleaning up...');
    // Remove UI elements
    if (container) {
      container.remove();
      container = null;
      button = null;
      dropdown = null;
    }
    // Stop observing
    if (typeof observer !== 'undefined' && observer) {
      observer.disconnect();
    }
  }

  async function sendMessage(message) {
    if (extensionInvalidated) return null;

    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.error('Starflow: chrome.runtime is not available');
        return null;
      }

      // Check if extension context is still valid
      if (!chrome.runtime.id) {
        handleExtensionInvalidated();
        return null;
      }

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (res) => {
          if (chrome.runtime.lastError) {
             const errorMsg = chrome.runtime.lastError.message || '';
             if (errorMsg.includes('Extension context invalidated')) {
               handleExtensionInvalidated();
               resolve(null);
             } else {
               // Ignore other errors like "message port closed"
               resolve(null);
             }
          } else {
             resolve(res);
          }
        });
      });

      if (response && response.error) {
        throw new Error(response.error);
      }
      return response ? response.data : null;
    } catch (error) {
      if (error.message && error.message.includes('Extension context invalidated')) {
        handleExtensionInvalidated();
        return null;
      }
      console.error(`Starflow Message ${message.type} failed:`, error);
      throw error;
    }
  }

  const starflowApi = {
    async isAuthenticated() { return sendMessage({ type: 'IS_AUTHENTICATED' }); },
    async getLists() { return sendMessage({ type: 'GET_LISTS' }); },
    async getRepoStatus(fullName) { return sendMessage({ type: 'GET_REPO_STATUS', payload: { fullName } }); },
    async addToList(repoId, listId) { return sendMessage({ type: 'ADD_TO_LIST', payload: { repoId, listId } }); },
    async removeFromList(repoId, listId) { return sendMessage({ type: 'REMOVE_FROM_LIST', payload: { repoId, listId } }); },
    async syncStars() { return sendMessage({ type: 'SYNC_STARS' }); },
    async classifyRepo(repositoryId) { return sendMessage({ type: 'CLASSIFY_REPO', payload: { repositoryId } }); },
    async getNote(repositoryId) { return sendMessage({ type: 'GET_NOTE', payload: { repositoryId } }); },
    async saveNote(repositoryId, content) { return sendMessage({ type: 'SAVE_NOTE', payload: { repositoryId, content } }); },
    async createList(name, color) { return sendMessage({ type: 'CREATE_LIST', payload: { name, color } }); }
  };

  // ==========================================
  // 2. UI Logic (Vanilla JS)
  // ==========================================

  const Icons = {
    bookmark: `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-bookmark mr-1"><path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.28.53L8 10.02l-3.72 4.76a.75.75 0 0 1-1.28-.53ZM4.75 2.5c-.138 0-.25.112-.25.25v9.938l3.03-3.876a.75.75 0 0 1 1.14 0l3.03 3.876V2.75a.25.25 0 0 0-.25-.25Z"></path></svg>`,
    check: `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>`,
    sync: `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-sync"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg>`,
    sparkles: `<svg aria-hidden="true" height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
    note: `<svg aria-hidden="true" height="14" viewBox="0 0 16 16" version="1.1" width="14" data-view-component="true" class="octicon"><path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25ZM3.5 6.25a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Zm.75 2.25h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Z"></path></svg>`,
    plus: `<svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path></svg>`,
    retry: `<svg aria-hidden="true" height="14" viewBox="0 0 16 16" version="1.1" width="14"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg>`
  };

  // Predefined colors for new lists
  const LIST_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'];

  let container = null;
  let button = null;
  let dropdown = null;
  let state = {
    isOpen: false, loading: false, isAuthenticated: false, lists: [], repo: null, repoName: '',
    aiLoading: false, aiSuggestion: null, note: '', originalNote: '', showNote: false, savingNote: false,
    error: null, newListName: '', creatingList: false, loadingListId: null,
    syncing: false, syncMessage: null
  };

  function renderButton() {
    if (!button) {
      button = document.createElement('button');
      button.className = 'btn btn-sm d-flex flex-items-center';
      button.type = 'button';
      button.onclick = toggleDropdown;
      container.appendChild(button);
    }

    const count = state.repo?.lists.length || 0;
    const iconClass = count > 0 ? 'color-fg-accent' : 'color-fg-muted';
    let iconSvg = Icons.bookmark;
    if (count > 0) {
      iconSvg = iconSvg.replace('fill="none"', 'fill="currentColor"').replace('<path ', '<path fill="currentColor" ');
    }

    button.innerHTML = `
      <span class="${iconClass}">${iconSvg}</span>
      <span class="d-none d-md-inline ml-1">Starflow</span>
      ${count > 0 ? `<span class="Counter ml-1">${count}</span>` : ''}
    `;
  }

  function renderDropdown() {
    if (!state.isOpen) {
      if (dropdown) { dropdown.remove(); dropdown = null; }
      return;
    }

    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'sf-dropdown';
      container.appendChild(dropdown);
    }

    let contentHtml = '';

    if (state.loading) {
      contentHtml = `<div class="sf-center sf-muted">Loading...</div>`;
    } else if (state.error) {
      // Error state with retry button
      contentHtml = `
        <div class="sf-error">
          <p class="sf-error-msg">${state.error}</p>
          <button id="sf-retry-btn" class="sf-btn sf-error-btn">
            ${Icons.retry} Retry
          </button>
        </div>`;
    } else if (!starflowBaseUrl) {
      // Server URL not configured
      contentHtml = `
        <div class="sf-center">
          <p class="sf-muted">Server not configured</p>
          <p class="sf-muted" style="font-size: 11px; margin-top: 4px;">Please configure server URL in the Starflow extension popup first.</p>
        </div>`;
    } else if (!state.isAuthenticated) {
      contentHtml = `
        <div class="sf-center">
          <p class="sf-muted">Please login to Starflow</p>
          <a href="${starflowBaseUrl}" target="_blank" class="sf-btn sf-btn-primary">Login</a>
        </div>`;
    } else if (!state.repo) {
      // Show different message based on sync state
      let syncContent = '';
      if (state.syncMessage === 'not_starred') {
        syncContent = `
          <p class="sf-muted" style="margin-bottom: 8px;">⚠️ This repository is not in your GitHub Stars.</p>
          <p class="sf-muted" style="font-size: 11px; margin-bottom: 12px;">Star it on GitHub first, then sync again.</p>
          <button id="sf-sync-btn" class="sf-btn" ${state.syncing ? 'disabled' : ''}>
            ${state.syncing ? 'Syncing...' : `${Icons.sync} Sync Again`}
          </button>`;
      } else if (state.syncMessage === 'error') {
        syncContent = `
          <p class="sf-muted" style="color: #f85149; margin-bottom: 12px;">❌ Sync failed. Please try again.</p>
          <button id="sf-sync-btn" class="sf-btn" ${state.syncing ? 'disabled' : ''}>
            ${state.syncing ? 'Syncing...' : `${Icons.sync} Retry Sync`}
          </button>`;
      } else {
        syncContent = `
          <p class="sf-muted">Repository not synced</p>
          <button id="sf-sync-btn" class="sf-btn sf-btn-primary" ${state.syncing ? 'disabled' : ''}>
            ${state.syncing ? 'Syncing...' : `${Icons.sync} Sync Stars`}
          </button>`;
      }
      contentHtml = `<div class="sf-center">${syncContent}</div>`;
    } else {
      // AI Section
      let aiSection = '';
      if (!state.aiSuggestion) {
        aiSection = `
          <button id="sf-ai-btn" class="sf-btn" ${state.aiLoading ? 'disabled' : ''}>
            ${state.aiLoading ? 'Analyzing...' : `${Icons.sparkles} AI Suggest`}
          </button>`;
      } else {
        aiSection = `
          <div class="sf-ai-result">
            <div class="sf-ai-result-header">
              <span>${Icons.sparkles} ${state.aiSuggestion.listName}</span>
              <button id="sf-ai-reset" class="sf-link-btn">Reset</button>
            </div>
            <div class="sf-ai-result-reason">${state.aiSuggestion.reason}</div>
          </div>`;
      }

      // Lists
      const listItems = state.lists.map(list => {
        const selected = state.repo?.lists.some(l => l.id === list.id);
        const isSuggested = state.aiSuggestion?.listName === list.name;
        const isLoading = state.loadingListId === list.id;
        return `
          <button type="button" class="sf-list-item ${isSuggested ? 'sf-suggested' : ''} ${isLoading ? 'sf-loading' : ''}" data-id="${list.id}" data-selected="${selected}">
            <span class="sf-check">${selected ? Icons.check : ''}</span>
            <span class="sf-color-dot" style="background-color:${list.color}"></span>
            <span class="sf-label">${list.name}</span>
            ${isSuggested ? '<span class="sf-badge">Suggested</span>' : ''}
          </button>`;
      }).join('');

      // Create new list section
      const createListSection = `
        <div class="sf-create-list">
          <input type="text" id="sf-new-list-input" class="sf-create-input" placeholder="New list name..." value="${state.newListName}" />
          <button id="sf-create-list-btn" class="sf-btn sf-btn-add" ${state.creatingList ? 'disabled' : ''}>
            ${state.creatingList ? '...' : Icons.plus}
          </button>
        </div>`;

      // Note Section
      let noteSection = '';
      if (!state.showNote && !state.originalNote) {
         noteSection = `
           <button id="sf-add-note-btn" class="sf-btn">
             ${Icons.note} Add Note
           </button>`;
      } else {
        const isSaved = state.note === state.originalNote && state.originalNote;
        noteSection = `
          <div class="sf-note-area">
            <div class="sf-note-header">
              <span>${Icons.note} Note</span>
              <div>
                 ${state.note !== state.originalNote ? `<button id="sf-save-note" class="sf-link-btn" ${state.savingNote ? 'disabled' : ''}>${state.savingNote ? 'Saving...' : 'Save'}</button>` : ''}
                 ${isSaved ? `<span class="sf-saved">${Icons.check} Saved</span>` : ''}
              </div>
            </div>
            <textarea id="sf-note-input" class="sf-note-textarea" rows="3" placeholder="Add a note...">${state.note}</textarea>
            <div class="sf-note-hint">Cmd+Enter to save</div>
          </div>`;
      }

      contentHtml = `
        <div class="sf-header">Manage Lists</div>
        <div class="sf-body">
           <div class="sf-section">${aiSection}</div>
           <div class="sf-section sf-list">${listItems}${createListSection}</div>
           <div class="sf-section">${noteSection}</div>
        </div>
        <div class="sf-footer">
          <a href="${starflowBaseUrl}" target="_blank">Open Starflow →</a>
        </div>`;
    }

    dropdown.innerHTML = contentHtml;
    attachEvents();
  }

  function attachEvents() {
      if (!dropdown) return;

      // Prevent all clicks inside dropdown from closing it
      dropdown.addEventListener('click', (e) => {
          e.stopPropagation();
      });

      // Retry button
      dropdown.querySelector('#sf-retry-btn')?.addEventListener('click', () => {
          state.error = null;
          fetchData();
      });

      dropdown.querySelector('#sf-sync-btn')?.addEventListener('click', async () => {
          state.syncing = true;
          state.syncMessage = null;
          renderDropdown();
          try {
              await starflowApi.syncStars();
              // Re-fetch repo status after sync
              const repo = await starflowApi.getRepoStatus(state.repoName);
              state.repo = repo;
              if (!repo) {
                  // Repo still not found - user hasn't starred it on GitHub
                  state.syncMessage = 'not_starred';
              }
          } catch(e) {
              console.error('Sync failed:', e);
              state.syncMessage = 'error';
          }
          state.syncing = false;
          renderDropdown();
          if (state.repo) {
              renderButton();
          }
      });
      dropdown.querySelector('#sf-ai-btn')?.addEventListener('click', async () => {
          state.aiLoading = true;
          updateAISection(); // Partial update
          try {
              if (state.repo) {
                 const res = await starflowApi.classifyRepo(state.repo.id);
                 if (res.suggestion) {
                     state.aiSuggestion = { listName: res.suggestion.suggestedListName || res.suggestion.newListName, reason: res.suggestion.reason };
                 }
              }
          } catch(e) { console.error(e); }
          state.aiLoading = false;
          updateAISection();
      });
      dropdown.querySelector('#sf-ai-reset')?.addEventListener('click', () => {
          state.aiSuggestion = null;
          updateAISection();
      });
      dropdown.querySelectorAll('.sf-list-item').forEach(el => {
          el.addEventListener('click', async (e) => {
              const btn = e.currentTarget;
              const listId = btn.dataset.id;
              const isSelected = btn.dataset.selected === 'true';
              if (state.repo && !state.loadingListId) {
                  state.loadingListId = listId;
                  renderDropdown();
                  try {
                      if (isSelected) {
                          state.repo.lists = state.repo.lists.filter(l => l.id !== listId);
                          await starflowApi.removeFromList(state.repo.id, listId);
                      } else {
                          const list = state.lists.find(l => l.id === listId);
                          if (list) state.repo.lists.push(list);
                          await starflowApi.addToList(state.repo.id, listId);
                      }
                  } catch(e) {
                      console.error(e);
                      // Revert on error
                      if (isSelected) {
                          const list = state.lists.find(l => l.id === listId);
                          if (list) state.repo.lists.push(list);
                      } else {
                          state.repo.lists = state.repo.lists.filter(l => l.id !== listId);
                      }
                  }
                  state.loadingListId = null;
                  renderButton();
                  renderDropdown();
              }
          });
      });

      // Create new list
      const newListInput = dropdown.querySelector('#sf-new-list-input');
      if (newListInput) {
          newListInput.addEventListener('input', (e) => {
              state.newListName = e.target.value;
              // No need to update anything else, button is always enabled
          });
          newListInput.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && state.newListName.trim() && !state.creatingList) {
                  e.preventDefault();
                  createNewList();
              }
          });
      }
      dropdown.querySelector('#sf-create-list-btn')?.addEventListener('click', () => {
          if (state.newListName.trim() && !state.creatingList) {
              createNewList();
          }
      });

      dropdown.querySelector('#sf-add-note-btn')?.addEventListener('click', () => {
          state.showNote = true;
          updateNoteSection(); // Partial update instead of full render
      });
      const textarea = dropdown.querySelector('#sf-note-input');
      if (textarea) {
          textarea.addEventListener('input', (e) => {
              state.note = e.target.value;
              const header = textarea.previousElementSibling;
              const btnContainer = header?.querySelector('.d-flex.gap-1');
              if (btnContainer && state.note !== state.originalNote && !btnContainer.querySelector('button')) {
                 btnContainer.innerHTML = `<button id="sf-save-note-dynamic" class="btn-link text-small">Save</button>`;
                 document.getElementById('sf-save-note-dynamic')?.addEventListener('click', saveNote);
              }
          });
          textarea.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  saveNote();
              }
          });
      }
      dropdown.querySelector('#sf-save-note')?.addEventListener('click', saveNote);
  }

  async function saveNote() {
      if (!state.repo) return;
      state.savingNote = true;
      updateNoteUI(); // Only update note section, not full dropdown
      try {
          await starflowApi.saveNote(state.repo.id, state.note);
          state.originalNote = state.note;
      } catch(e) { console.error(e); }
      state.savingNote = false;
      updateNoteUI();
  }

  async function createNewList() {
      if (!state.newListName.trim() || state.creatingList) return;
      state.creatingList = true;

      // Update button state without full re-render
      const createBtn = dropdown?.querySelector('#sf-create-list-btn');
      const input = dropdown?.querySelector('#sf-new-list-input');
      if (createBtn) {
          createBtn.disabled = true;
          createBtn.innerHTML = '...';
      }

      try {
          // Pick a random color
          const color = LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)];
          const newList = await starflowApi.createList(state.newListName.trim(), color);
          if (newList) {
              state.lists.push(newList);
              state.newListName = '';

              // Partial update: add new list item without full re-render
              const listContainer = dropdown?.querySelector('.sf-section.sf-list');
              if (listContainer) {
                  const createListDiv = listContainer.querySelector('.sf-create-list');
                  if (createListDiv) {
                      // Insert new list item before create section
                      const newListHtml = `
                        <button type="button" class="sf-list-item" data-id="${newList.id}" data-selected="false">
                          <span class="sf-check"></span>
                          <span class="sf-color-dot" style="background-color:${newList.color}"></span>
                          <span class="sf-label">${newList.name}</span>
                        </button>`;
                      createListDiv.insertAdjacentHTML('beforebegin', newListHtml);

                      // Attach click event to new item
                      const newItem = createListDiv.previousElementSibling;
                      if (newItem) {
                          newItem.addEventListener('click', async (e) => {
                              const btn = e.currentTarget;
                              const listId = btn.dataset.id;
                              const isSelected = btn.dataset.selected === 'true';
                              if (state.repo && !state.loadingListId) {
                                  state.loadingListId = listId;
                                  btn.classList.add('sf-loading');
                                  try {
                                      if (isSelected) {
                                          state.repo.lists = state.repo.lists.filter(l => l.id !== listId);
                                          await starflowApi.removeFromList(state.repo.id, listId);
                                          btn.dataset.selected = 'false';
                                          btn.querySelector('.sf-check').innerHTML = '';
                                      } else {
                                          const list = state.lists.find(l => l.id === listId);
                                          if (list) state.repo.lists.push(list);
                                          await starflowApi.addToList(state.repo.id, listId);
                                          btn.dataset.selected = 'true';
                                          btn.querySelector('.sf-check').innerHTML = Icons.check;
                                      }
                                      renderButton();
                                  } catch(err) {
                                      console.error(err);
                                  }
                                  state.loadingListId = null;
                                  btn.classList.remove('sf-loading');
                              }
                          });
                      }
                  }

                  // Clear input and restore button
                  if (input) input.value = '';
                  if (createBtn) {
                      createBtn.disabled = false;
                      createBtn.innerHTML = Icons.plus;
                  }
              }
          }
      } catch(e) {
          console.error(e);
          // Restore button on error
          if (createBtn) {
              createBtn.disabled = false;
              createBtn.innerHTML = Icons.plus;
          }
      }
      state.creatingList = false;
  }

  // Partial update for note section to avoid scroll reset
  function updateNoteUI() {
      if (!dropdown) return;
      const saveBtn = dropdown.querySelector('#sf-save-note');
      const noteHeader = dropdown.querySelector('.sf-note-header > div');
      if (noteHeader) {
          const isSaved = state.note === state.originalNote && state.originalNote;
          if (state.savingNote) {
              noteHeader.innerHTML = `<button class="sf-link-btn" disabled>Saving...</button>`;
          } else if (state.note !== state.originalNote) {
              noteHeader.innerHTML = `<button id="sf-save-note" class="sf-link-btn">Save</button>`;
              noteHeader.querySelector('#sf-save-note')?.addEventListener('click', saveNote);
          } else if (isSaved) {
              noteHeader.innerHTML = `<span class="sf-saved">${Icons.check} Saved</span>`;
          } else {
              noteHeader.innerHTML = '';
          }
      }
  }

  // Full update of note section (for Add Note button)
  function updateNoteSection() {
      if (!dropdown) return;
      const noteContainer = dropdown.querySelector('.sf-body > .sf-section:last-child');
      if (!noteContainer) return;

      const isSaved = state.note === state.originalNote && state.originalNote;
      const noteHtml = `
        <div class="sf-note-area">
          <div class="sf-note-header">
            <span>${Icons.note} Note</span>
            <div>
               ${state.note !== state.originalNote ? `<button id="sf-save-note" class="sf-link-btn" ${state.savingNote ? 'disabled' : ''}>${state.savingNote ? 'Saving...' : 'Save'}</button>` : ''}
               ${isSaved ? `<span class="sf-saved">${Icons.check} Saved</span>` : ''}
            </div>
          </div>
          <textarea id="sf-note-input" class="sf-note-textarea" rows="3" placeholder="Add a note...">${state.note}</textarea>
          <div class="sf-note-hint">Cmd+Enter to save</div>
        </div>`;

      noteContainer.innerHTML = noteHtml;

      // Re-attach events
      const textarea = noteContainer.querySelector('#sf-note-input');
      if (textarea) {
          textarea.addEventListener('input', (e) => {
              state.note = e.target.value;
              updateNoteUI();
          });
          textarea.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  saveNote();
              }
          });
          textarea.focus();
      }
      noteContainer.querySelector('#sf-save-note')?.addEventListener('click', saveNote);
  }

  // Partial update for AI section to avoid scroll reset
  function updateAISection() {
      if (!dropdown) return;
      const aiContainer = dropdown.querySelector('.sf-body > .sf-section:first-child');
      if (!aiContainer) return;

      let aiHtml = '';
      if (!state.aiSuggestion) {
        aiHtml = `
          <button id="sf-ai-btn" class="sf-btn" ${state.aiLoading ? 'disabled' : ''}>
            ${state.aiLoading ? 'Analyzing...' : `${Icons.sparkles} AI Suggest`}
          </button>`;
      } else {
        aiHtml = `
          <div class="sf-ai-result">
            <div class="sf-ai-result-header">
              <span>${Icons.sparkles} ${state.aiSuggestion.listName}</span>
              <button id="sf-ai-reset" class="sf-link-btn">Reset</button>
            </div>
            <div class="sf-ai-result-reason">${state.aiSuggestion.reason}</div>
          </div>`;
      }

      aiContainer.innerHTML = aiHtml;

      // Re-attach events
      aiContainer.querySelector('#sf-ai-btn')?.addEventListener('click', async () => {
          state.aiLoading = true;
          updateAISection();
          try {
              if (state.repo) {
                 const res = await starflowApi.classifyRepo(state.repo.id);
                 if (res.suggestion) {
                     state.aiSuggestion = { listName: res.suggestion.suggestedListName || res.suggestion.newListName, reason: res.suggestion.reason };
                 }
              }
          } catch(e) { console.error(e); }
          state.aiLoading = false;
          updateAISection();
      });
      aiContainer.querySelector('#sf-ai-reset')?.addEventListener('click', () => {
          state.aiSuggestion = null;
          updateAISection();
      });
  }

  async function fetchData() {
      state.loading = true;
      state.error = null;
      renderDropdown();
      try {
          state.isAuthenticated = await starflowApi.isAuthenticated();
          if (state.isAuthenticated) {
              const [lists, repo] = await Promise.all([
                  starflowApi.getLists(),
                  starflowApi.getRepoStatus(state.repoName)
              ]);
              state.lists = lists || [];
              state.repo = repo;
              renderButton();
              if (repo) {
                  try {
                      const noteData = await starflowApi.getNote(repo.id);
                      state.note = noteData.content || '';
                      state.originalNote = noteData.content || '';
                  } catch(e) {}
              }
          }
      } catch(e) {
          console.error(e);
          state.error = e.message || 'Failed to load data';
      }
      state.loading = false;
      if (state.isOpen) renderDropdown();
  }

  function toggleDropdown(e) {
      e.stopPropagation();
      state.isOpen = !state.isOpen;
      renderDropdown();
      if (state.isOpen) fetchData();
  }

  function mount() {
      if (document.getElementById('starflow-btn-container')) return;
      let anchor = document.querySelector('.pagehead-actions');
      if (!anchor) {
          const starBtn = document.querySelector('iframe[src*="star"]');
          if (starBtn && starBtn.parentElement) anchor = starBtn.parentElement.parentElement;
      }
      // Fallback
      if (!anchor) anchor = document.querySelector('#repository-details-container ul');

      if (!anchor) return;

      container = document.createElement('li');
      container.id = 'starflow-btn-container';
      container.className = 'd-inline-block position-relative';
      // No extra margin - rely on GitHub's natural li spacing
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length < 3) return;
      state.repoName = `${pathParts[1]}/${pathParts[2]}`;
      anchor.append(container);
      renderButton();
  }

  // Init
  console.log('Starflow: Inject script loaded');
  let lastUrl = location.href;

  function checkAndMount() {
    // Check if URL changed (GitHub SPA navigation)
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // Reset state for new page
      if (container) {
        container.remove();
        container = null;
        button = null;
        dropdown = null;
      }
      state.isOpen = false;
      state.repo = null;
      state.repoName = '';
      state.aiSuggestion = null;
      state.note = '';
      state.originalNote = '';
      state.showNote = false;
      state.error = null;
      state.newListName = '';
      state.creatingList = false;
      state.loadingListId = null;
    }

    // Try to mount if not already mounted
    if (!document.getElementById('starflow-btn-container')) {
      mount();
    }
  }

  // Initial mount
  mount();

  // Watch for DOM changes (GitHub SPA navigation)
  const observer = new MutationObserver(() => {
    checkAndMount();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Also listen for popstate (browser back/forward)
  window.addEventListener('popstate', () => {
    setTimeout(checkAndMount, 100);
  });

  // Listen for GitHub's turbo navigation
  document.addEventListener('turbo:load', () => {
    checkAndMount();
  });
  document.addEventListener('turbo:render', () => {
    checkAndMount();
  });

  document.addEventListener('click', (e) => {
      if (state.isOpen && container && !container.contains(e.target)) {
          state.isOpen = false;
          renderDropdown();
      }
  });

})();
