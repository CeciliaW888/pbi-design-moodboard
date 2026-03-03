import { motion } from 'framer-motion';
import { Home, FolderOpen, LayoutTemplate, BookOpen, ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'projects', label: 'My Projects', Icon: FolderOpen },
  { id: 'templates', label: 'Templates', Icon: LayoutTemplate },
  { id: 'resources', label: 'Resources', Icon: BookOpen },
];

export default function Sidebar({ collapsed, onToggle, currentView, onNavigate, user }) {
  const width = collapsed ? 60 : 260;

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

      {/* Workspaces section (placeholder for Phase 2) */}
      <div className="border-t border-surface-lighter p-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Workspaces</span>
              <button className="p-0.5 text-text-muted hover:text-primary transition-colors" title="Create workspace">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">
                <Users size={14} className="flex-shrink-0" />
                <span className="truncate">Personal</span>
              </button>
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
