import { useEffect, useState, useRef } from 'react';
import { Bookmark, RefreshCw, LogIn, Check, Plus, Loader2, Sparkles, StickyNote, Save } from 'lucide-react';
import { starflowApi, type StarflowList, type StarflowRepo } from '../lib/api';

interface StarflowButtonProps {
  repoName: string; // "owner/name"
}

export const StarflowButton = ({ repoName }: StarflowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [lists, setLists] = useState<StarflowList[]>([]);
  const [repo, setRepo] = useState<StarflowRepo | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ listName: string, reason: string } | null>(null);

  // Note state
  const [note, setNote] = useState('');
  const [originalNote, setOriginalNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial data fetch
  const fetchData = async () => {
    setLoading(true);
    try {
      const auth = await starflowApi.isAuthenticated();
      setIsAuthenticated(auth);

      if (auth) {
        const [fetchedLists, fetchedRepo] = await Promise.all([
          starflowApi.getLists(),
          starflowApi.getRepoStatus(repoName)
        ]);
        setLists(fetchedLists);
        setRepo(fetchedRepo);

        if (fetchedRepo) {
           try {
             const noteData = await starflowApi.getNote(fetchedRepo.id);
             setNote(noteData.content || '');
             setOriginalNote(noteData.content || '');
           } catch (e) {
             console.error('Failed to fetch note', e);
           }
        }
      }
    } catch (error) {
      console.error('Starflow fetch error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, repoName]);

  const handleToggleList = async (listId: string, isInList: boolean) => {
    if (!repo) return;

    // Optimistic update
    const previousRepo = repo;
    const newLists = isInList
      ? repo.lists.filter(l => l.id !== listId)
      : [...repo.lists, lists.find(l => l.id === listId)!];

    setRepo({ ...repo, lists: newLists });

    try {
      if (isInList) {
        await starflowApi.removeFromList(repo.id, listId);
      } else {
        await starflowApi.addToList(repo.id, listId);
      }
    } catch (error) {
      console.error('Failed to toggle list:', error);
      setRepo(previousRepo); // Revert on error
    }
  };

  const handleAiClassify = async () => {
    if (!repo) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await starflowApi.classifyRepo(repo.id);
      if (result.suggestion) {
        setAiSuggestion({
          listName: result.suggestion.primary,
          reason: result.suggestion.reasoning
        });

        // Auto-select if confident enough (optional, for now just show suggestion)
        const targetList = lists.find(l => l.name === result.suggestion.primary);
        if (targetList && !isInList(targetList.id)) {
           // We could auto-add here, but maybe let user click to confirm?
           // For P2, let's just highlight it or show a distinct UI
        }
      }
    } catch (error) {
      console.error('AI Classify failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await starflowApi.syncStars();
      await fetchData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!repo) return;
    setSavingNote(true);
    try {
      await starflowApi.saveNote(repo.id, note);
      setOriginalNote(note);
      // Optional: show success feedback
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  // Check if repo is in a specific list
  const isInList = (listId: string) => repo?.lists.some(l => l.id === listId);

  // Calculate active count
  const activeCount = repo?.lists.length || 0;

  return (
    <div className="position-relative d-inline-block ml-2" ref={dropdownRef}>
      <button
        className="btn btn-sm d-flex flex-items-center"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Manage Starflow lists"
        aria-expanded={isOpen}
      >
        <Bookmark size={16} className={`mr-1 ${activeCount > 0 ? 'color-fg-accent' : 'color-fg-muted'}`} fill={activeCount > 0 ? "currentColor" : "none"} />
        <span className="d-none d-md-inline">Starflow</span>
        {activeCount > 0 && (
          <span className="Counter ml-1">{activeCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="
          position-absolute right-0 mt-2 z-50
          Box Box--overlay color-shadow-large
          anim-fade-in-fast
        " style={{ width: '300px', zIndex: 100 }}>
          <div className="Box-header">
            <h3 className="Box-title text-bold f6">Manage Lists</h3>
          </div>

          <div className="Box-body overflow-auto p-0" style={{ maxHeight: '300px' }}>
            {loading ? (
              <div className="p-4 text-center color-fg-muted">
                <Loader2 className="animate-spin mx-auto mb-2" />
                <span>Loading...</span>
              </div>
            ) : !isAuthenticated ? (
              <div className="p-4 text-center">
                <p className="mb-3 text-small color-fg-muted">You need to be logged into Starflow</p>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm width-full d-flex flex-items-center flex-justify-center gap-2"
                >
                  <LogIn size={14} />
                  Login to Starflow
                </a>
              </div>
            ) : !repo ? (
              <div className="p-4 text-center">
                <p className="mb-3 text-small color-fg-muted">
                  This repository is not in your Starflow yet.
                </p>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn btn-primary btn-sm width-full d-flex flex-items-center flex-justify-center gap-2"
                >
                  {syncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  Sync Stars
                </button>
              </div>
            ) : (
              <>
                <div className="border-bottom p-2">
                  {!aiSuggestion ? (
                    <button
                      onClick={handleAiClassify}
                      disabled={aiLoading}
                      className="btn btn-sm width-full d-flex flex-items-center flex-justify-center gap-2 color-fg-muted"
                    >
                      {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                      {aiLoading ? 'Analyzing...' : 'AI Suggest'}
                    </button>
                  ) : (
                    <div className="flash flash-full p-2 text-small">
                      <div className="d-flex flex-items-center flex-justify-between mb-1">
                        <strong className="d-flex flex-items-center gap-1">
                          <Sparkles size={12} />
                          {aiSuggestion.listName}
                        </strong>
                        <button
                          className="btn-link text-small"
                          onClick={() => setAiSuggestion(null)}
                        >
                          Reset
                        </button>
                      </div>
                      <div className="color-fg-muted" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                        {aiSuggestion.reason}
                      </div>
                    </div>
                  )}
                </div>
                <ul className="ActionList">
                  {lists.map(list => {
                    const selected = isInList(list.id);
                    const isSuggested = aiSuggestion?.listName === list.name;
                    return (
                      <li key={list.id} className={`ActionList-item ${isSuggested ? 'color-bg-subtle' : ''}`} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          className="ActionList-content"
                          onClick={() => handleToggleList(list.id, selected || false)}
                        >
                          <span className="ActionList-item-action ActionList-item-action--leading">
                             {selected && <Check size={16} />}
                          </span>
                          <span className="ActionList-item-label">
                            <span
                              className="d-inline-block circle mr-2"
                              style={{ width: '8px', height: '8px', backgroundColor: list.color }}
                            />
                            {list.name}
                            {isSuggested && <span className="Label ml-2 Label--accent">Suggested</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-top p-2">
                   {!showNote && !originalNote ? (
                     <button
                       onClick={() => setShowNote(true)}
                       className="btn btn-sm width-full d-flex flex-items-center flex-justify-center gap-2 color-fg-muted"
                     >
                       <StickyNote size={14} />
                       Add Note
                     </button>
                   ) : (
                     <div className="anim-fade-in-fast">
                       <div className="d-flex flex-items-center flex-justify-between mb-1">
                         <span className="text-small text-bold d-flex flex-items-center gap-1">
                           <StickyNote size={12} />
                           Note
                         </span>
                         <div className="d-flex gap-1">
                           {note !== originalNote && (
                             <button
                               className="btn-link text-small"
                               onClick={handleSaveNote}
                               disabled={savingNote}
                             >
                               {savingNote ? 'Saving...' : 'Save'}
                             </button>
                           )}
                           {note === originalNote && originalNote && (
                             <span className="text-small color-fg-success d-flex flex-items-center gap-1">
                               <Check size={12} /> Saved
                             </span>
                           )}
                         </div>
                       </div>
                       <textarea
                         className="form-control width-full text-small input-sm"
                         rows={3}
                         placeholder="Add a note about this repository..."
                         value={note}
                         onChange={(e) => setNote(e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                             handleSaveNote();
                           }
                         }}
                       />
                       <div className="text-right mt-1">
                          <span className="text-tiny color-fg-muted">Cmd/Ctrl+Enter to save</span>
                       </div>
                     </div>
                   )}
                </div>
              </>
            )}
          </div>

          {isAuthenticated && (
            <div className="Box-footer text-right">
               <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-link text-small text-no-underline color-fg-muted"
               >
                 Open Starflow →
               </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
