import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ExternalLink, LogIn, CheckCircle2, AlertCircle, Settings, Save, X } from 'lucide-react';
import './style.css';

const DEFAULT_API_URL = '';
const STORAGE_KEY = 'starflow_api_url';

// Get version from manifest
const getVersion = () => {
  try {
    return browser.runtime.getManifest().version;
  } catch {
    return '0.1.0';
  }
};

// Starflow Logo SVG (matching main project)
const Logo = () => (
  <svg viewBox="20 34 216 216" className="w-10 h-10">
    <defs>
      <mask id="sfFlow" maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width="256" height="256" fill="#fff"/>
        <path
          d="M34 146 C88 112 122 124 148 156 C174 188 180 212 198 228"
          stroke="#000" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path
          d="M34 146 C88 112 122 124 148 156 C174 188 180 212 198 228"
          stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </mask>
    </defs>
    <path fill="#0f766e" mask="url(#sfFlow)"
      d="M66 64 H154 a18 18 0 0 1 12.7 5.3 L214 116.6 a18 18 0 0 1 0 25.5 L142 214 a18 18 0 0 1-25.5 0 L48 145.5 a18 18 0 0 1-5.3-12.7 V82 a18 18 0 0 1 18-18 Z"/>
    <circle cx="84" cy="92" r="12" fill="#f8fafc" opacity="0.92"/>
  </svg>
);

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [tempApiUrl, setTempApiUrl] = useState(DEFAULT_API_URL);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await browser.storage.local.get(STORAGE_KEY);
      const savedUrl = result[STORAGE_KEY] || '';
      setApiUrl(savedUrl);
      setTempApiUrl(savedUrl);
      if (savedUrl) {
        checkAuth(savedUrl);
      } else {
        // No URL configured, show settings
        setShowSettings(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: tempApiUrl });
      setApiUrl(tempApiUrl);
      setShowSettings(false);
      setMessage({ type: 'success', text: 'Settings saved!' });
      setTimeout(() => setMessage(null), 2000);
      checkAuth(tempApiUrl);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    }
  };

  const checkAuth = async (url: string) => {
    setLoading(true);
    try {
      // Use background script to check auth (it has proper cookie access)
      await browser.storage.local.set({ [STORAGE_KEY]: url });
      const result = await browser.runtime.sendMessage({ type: 'IS_AUTHENTICATED' });
      setIsAuthenticated(result?.data === true);
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
      // Use background script for sync
      const result = await browser.runtime.sendMessage({ type: 'SYNC_STARS' });
      if (result?.data) {
        setMessage({ type: 'success', text: 'Sync completed!' });
        setTimeout(() => setMessage(null), 2000);
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to sync stars.' });
    } finally {
      setSyncing(false);
    }
  };

  const openDashboard = () => {
    window.open(apiUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="w-80 h-52 flex items-center justify-center bg-[#141414]">
        <Loader2 className="animate-spin text-teal-500" size={28} />
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#141414] text-[#fafafa] font-sans text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="font-semibold text-lg leading-tight tracking-wide">Starflow</h1>
            <p className="text-xs text-white/50">GitHub Star Manager</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/70">Server URL</span>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded text-white/40 hover:text-white/70 hover:bg-white/10"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempApiUrl}
              onChange={(e) => setTempApiUrl(e.target.value)}
              placeholder="https://your-server.com"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            />
            <button
              onClick={saveSettings}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
              title="Save"
            >
              <Save size={16} />
            </button>
          </div>
          <p className="text-[10px] text-white/40 mt-2">
            Enter your Starflow server address
          </p>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {isAuthenticated ? (
          <>
            {/* Connected Status */}
            <div className="flex items-center gap-2 text-teal-400 bg-teal-500/10 border border-teal-500/20 p-3 rounded-lg text-sm">
              <CheckCircle2 size={18} />
              <span className="font-medium">Connected</span>
              <span className="text-teal-500/60 text-xs ml-auto truncate max-w-[100px]" title={apiUrl}>
                {apiUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 py-2.5 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
            >
              {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              {syncing ? 'Syncing...' : 'Sync Stars'}
            </button>

            {/* Message */}
            {message && (
              <div className={`text-xs p-2.5 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                  : 'text-red-400 bg-red-500/10 border border-red-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {message.text}
              </div>
            )}

            {/* Open Dashboard */}
            <button
              onClick={openDashboard}
              className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-teal-400 py-2 text-sm transition-colors"
            >
              Open Dashboard <ExternalLink size={14} />
            </button>
          </>
        ) : (
          <>
            {/* Not Connected */}
            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>Not connected. Please login first.</span>
            </div>

            {/* Login Button */}
            <button
              onClick={openDashboard}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-lg transition-all text-sm font-medium"
            >
              <LogIn size={16} />
              Login to Starflow
            </button>

            {/* Message */}
            {message && (
              <div className={`text-xs p-2.5 rounded-lg ${
                message.type === 'success'
                  ? 'text-teal-400 bg-teal-500/10'
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {message.text}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-center">
        <span className="text-[10px] text-white/30">
          Starflow Extension v{getVersion()}
        </span>
      </div>
    </div>
  );
}

export default App;
