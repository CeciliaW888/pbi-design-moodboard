import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Sun, Moon, Menu, ArrowLeft, Share2, Copy, Check, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PresenceAvatars from './PresenceAvatars';
import { sanitizeName } from '../lib/validation';

export default function Header({
  user,
  onSignIn,
  onSignOut,
  themeName,
  onNameChange,
  theme,
  onToggleTheme,
  currentView,
  onGoHome,
  onToggleSidebar,
  activeUsers = [],
  workspaceId,
  projectId,
  onSave,
}) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef(null);
  const isEditor = currentView === 'editor';
  const isPrototype = currentView === 'prototype';
  const isInEditor = isEditor || isPrototype;

  useEffect(() => {
    function handleClickOutside(e) {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShowShare(false);
    }
    if (showShare) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShare]);

  const shareUrl = workspaceId && projectId
    ? `${window.location.origin}?ws=${workspaceId}&project=${projectId}`
    : null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-surface-lighter bg-surface-light/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle / Back button */}
        {isInEditor ? (
          <button
            onClick={onGoHome}
            className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
            title="Back to Home"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors lg:hidden"
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
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
              onChange={(e) => onNameChange(sanitizeName(e.target.value))}
              className="bg-transparent text-lg font-bold text-text outline-none border-b border-transparent hover:border-surface-lighter focus:border-primary transition-colors w-64"
            />
            <p className="text-xs text-text-muted">AI Design Studio for Power BI</p>
          </div>
        ) : (
          <div>
            <h1 className="text-lg font-bold text-text">Ditto</h1>
            <p className="text-xs text-text-muted">Power BI Design System</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Presence avatars — editor/prototype only */}
        {isInEditor && activeUsers.length > 0 && (
          <PresenceAvatars users={activeUsers} currentUserId={user?.uid} />
        )}

        {/* Share button — editor/prototype only */}
        {isInEditor && (
          <div ref={shareRef} className="relative">
            <button
              onClick={() => {
                setShowShare(prev => !prev);
                // Auto-save when opening share panel
                if (!showShare && onSave) onSave();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showShare
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
              title="Share for collaboration"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-surface-light border border-surface-lighter rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-1">
                      <Link2 size={14} className="text-primary" />
                      Share this project
                    </h3>
                    <p className="text-[11px] text-text-muted mb-3">
                      Anyone with the link can view and edit in real-time
                    </p>

                    {user ? (
                      shareUrl ? (
                        <div className="space-y-3">
                          {/* Link preview */}
                          <div className="flex items-center gap-2 bg-surface rounded-lg border border-surface-lighter p-2">
                            <input
                              type="text"
                              value={shareUrl}
                              readOnly
                              className="flex-1 bg-transparent text-[11px] text-text-muted outline-none font-mono truncate"
                            />
                            <button
                              onClick={handleCopyLink}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all flex-shrink-0 ${
                                copied
                                  ? 'bg-green-500/10 text-green-600'
                                  : 'bg-primary text-white hover:bg-primary-dark'
                              }`}
                            >
                              {copied ? <Check size={12} /> : <Copy size={12} />}
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </div>

                          {/* Active collaborators */}
                          {activeUsers.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
                                Active now ({activeUsers.length})
                              </p>
                              <div className="space-y-1">
                                {activeUsers.slice(0, 5).map(u => (
                                  <div key={u.odId || u.email} className="flex items-center gap-2 py-1">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0">
                                      {(u.name || u.email || '?')[0].toUpperCase()}
                                    </div>
                                    <span className="text-[11px] text-text truncate">{u.name || u.email}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 ml-auto" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-xs text-text-muted mb-2">
                            Save this project first to enable sharing
                          </p>
                          {onSave && (
                            <button
                              onClick={async () => {
                                await onSave();
                                setShowShare(true);
                              }}
                              className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                            >
                              Save Project
                            </button>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-text-muted mb-2">Sign in to share and collaborate</p>
                        <button
                          onClick={() => { onSignIn(); setShowShare(false); }}
                          className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
                    )}
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
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0078D4&color=fff&size=32`}
              alt={`${user.displayName || user.email} avatar`}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0078D4&color=fff&size=32`;
              }}
            />
            <span className="text-sm text-text-muted hidden sm:block">{user.displayName || user.email}</span>
            <button onClick={onSignOut} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors" title="Sign out" aria-label="Sign out">
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
