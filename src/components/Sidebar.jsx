import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FolderOpen, Compass, ChevronLeft, ChevronRight, Plus, Users, Check, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'projects', label: 'Projects', Icon: FolderOpen },
  { id: 'gallery', label: 'Gallery', Icon: Compass },
];

export default function Sidebar({
  collapsed,
  onToggle,
  currentView,
  onNavigate,
  user,
  workspaces = [],
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
}) {
  const width = collapsed ? 60 : 260;
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleCreateSubmit = () => {
    const name = newWorkspaceName.trim();
    if (name) {
      onCreateWorkspace?.(name);
    }
    setNewWorkspaceName('');
    setCreatingWorkspace(false);
  };

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full bg-surface-light border-r border-surface-lighter flex flex-col flex-shrink-0 overflow-hidden z-30"
    >
      {/* User section + toggle */}
      <div className="flex items-center justify-between p-3 border-b border-surface-lighter min-h-[56px]">
        {!collapsed && user && (
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0078D4&color=fff&size=32`}
              alt=""
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">{user.displayName || 'User'}</p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        {collapsed && user && (
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0078D4&color=fff&size=32`}
            alt=""
            className="w-8 h-8 rounded-full mx-auto"
          />
        )}
        {!user && !collapsed && (
          <span className="text-sm text-text-muted">Not signed in</span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
              } ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Workspaces section */}
      <div className="border-t border-surface-lighter p-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Workspaces</span>
              <button
                onClick={() => setCreatingWorkspace(true)}
                className="p-0.5 text-text-muted hover:text-primary transition-colors"
                title="Create workspace"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId;
                return (
                  <button
                    key={ws.id}
                    onClick={() => onSelectWorkspace?.(ws.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-text-muted hover:text-text hover:bg-surface'
                    }`}
                  >
                    <Users size={14} className="flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{ws.name}</span>
                    {(ws.members?.length || 0) > 1 && (
                      <span className="text-[10px] text-text-muted/60 flex-shrink-0">
                        {ws.members.length}
                      </span>
                    )}
                  </button>
                );
              })}

              {workspaces.length === 0 && !creatingWorkspace && (
                <p className="text-xs text-text-muted/50 text-center py-2">No workspaces</p>
              )}

              {/* Inline create workspace */}
              <AnimatePresence>
                {creatingWorkspace && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        autoFocus
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateSubmit();
                          if (e.key === 'Escape') { setCreatingWorkspace(false); setNewWorkspaceName(''); }
                        }}
                        onBlur={() => { if (!newWorkspaceName.trim()) setCreatingWorkspace(false); }}
                        placeholder="Workspace name..."
                        className="flex-1 bg-surface border border-surface-lighter rounded px-2 py-1 text-xs text-text outline-none focus:border-primary min-w-0"
                      />
                      <button
                        onClick={handleCreateSubmit}
                        disabled={!newWorkspaceName.trim()}
                        className="p-1 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-30"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            className="w-full flex justify-center p-2.5 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
            title="Workspaces"
          >
            <Users size={18} />
          </button>
        )}
      </div>
    </motion.aside>
  );
}
