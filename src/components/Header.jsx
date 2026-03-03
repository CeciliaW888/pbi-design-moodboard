import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Sun, Moon, Settings, ExternalLink, Key, Menu, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PresenceAvatars from './PresenceAvatars';

export default function Header({
  user,
  onSignIn,
  onSignOut,
  themeName,
  onNameChange,
  theme,
  onToggleTheme,
  geminiApiKey,
  onGeminiApiKeyChange,
  currentView,
  onGoHome,
  onToggleSidebar,
  // Phase 3: presence
  activeUsers = [],
}) {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const isEditor = currentView === 'editor';

  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    }
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettings]);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-surface-lighter bg-surface-light/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle / Back button */}
        {isEditor ? (
          <button
            onClick={onGoHome}
            className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors lg:hidden"
            title="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="11" width="4" height="7" rx="1" fill="#F2C811"/>
            <rect x="8" y="7" width="4" height="11" rx="1" fill="white"/>
            <rect x="14" y="3" width="4" height="15" rx="1" fill="white" opacity="0.7"/>
          </svg>
        </div>

        {isEditor ? (
          <div>
            <input
              type="text"
              value={themeName}
              onChange={(e) => onNameChange(e.target.value)}
              className="bg-transparent text-lg font-bold text-text outline-none border-b border-transparent hover:border-surface-lighter focus:border-primary transition-colors w-64"
            />
            <p className="text-xs text-text-muted">Power BI Design Moodboard</p>
          </div>
        ) : (
          <div>
            <h1 className="text-lg font-bold text-text">PBI Moodboard</h1>
            <p className="text-xs text-text-muted">Power BI Design System</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Presence avatars — editor only */}
        {isEditor && activeUsers.length > 0 && (
          <PresenceAvatars users={activeUsers} currentUserId={user?.uid} />
        )}

        {/* Settings gear — only show in editor */}
        {isEditor && (
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setShowSettings(prev => !prev)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                showSettings ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-text hover:bg-surface'
              } ${!geminiApiKey ? 'ring-2 ring-primary/40' : ''}`}
              title="Settings"
            >
              <Settings size={18} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-surface-light border border-surface-lighter rounded-xl shadow-2xl p-4 z-50"
                >
                  <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-3">
                    <Key size={14} className="text-primary" />
                    Gemini API Key
                  </h3>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => onGeminiApiKeyChange(e.target.value)}
                    placeholder="AIza…"
                    className="w-full bg-surface border border-surface-lighter rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-mono"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-text-muted">
                      Used only in your browser. Never sent to any server.
                    </p>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      Get free key <ExternalLink size={9} />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <button
          onClick={onToggleTheme}
          className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-all duration-300"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.div>
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=0078D4&color=fff&size=32`}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-text-muted hidden sm:block">{user.displayName || user.email}</span>
            <button onClick={onSignOut} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted bg-surface hover:bg-surface-lighter rounded-lg transition-colors"
          >
            <User size={16} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
