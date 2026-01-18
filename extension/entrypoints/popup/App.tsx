import { useEffect, useState } from 'react';
import { starflowApi } from '../../lib/api';
import { Loader2, RefreshCw, ExternalLink, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import '@/assets/style.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const auth = await starflowApi.isAuthenticated();
      setIsAuthenticated(auth);
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      await starflowApi.syncStars();
      setMessage({ type: 'success', text: 'Sync completed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to sync stars.' });
    } finally {
      setSyncing(false);
    }
  };

  const openDashboard = () => {
    window.open('http://localhost:3000', '_blank');
  };

  if (loading) {
    return (
      <div className="w-[300px] h-[200px] flex items-center justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="w-[300px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 font-sans">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          S
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Starflow</h1>
          <p className="text-xs text-slate-500">GitHub Star Manager</p>
        </div>
      </div>

      <div className="space-y-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-sm">
              <CheckCircle2 size={16} />
              <span className="font-medium">Connected to Starflow</span>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 py-2.5 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
            >
              {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              {syncing ? 'Syncing...' : 'Sync Stars Now'}
            </button>

            {message && (
              <div className={`text-xs p-2 rounded-md ${
                message.type === 'success'
                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'text-red-600 bg-red-50 dark:bg-red-900/20'
              }`}>
                {message.text}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mb-4 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md flex items-center gap-2 text-sm text-left">
              <AlertCircle size={16} className="shrink-0" />
              <span>Not authenticated. Please login to the dashboard.</span>
            </div>

            <button
              onClick={openDashboard}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md transition-colors text-sm font-medium"
            >
              <LogIn size={16} />
              Login to Starflow
            </button>
          </div>
        )}

        {isAuthenticated && (
          <button
            onClick={openDashboard}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 py-2 text-sm transition-colors"
          >
            Open Dashboard <ExternalLink size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
