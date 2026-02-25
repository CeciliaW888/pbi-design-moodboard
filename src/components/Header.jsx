import { LogOut, User, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ user, onSignIn, onSignOut, themeName, onNameChange, theme, onToggleTheme }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-surface-lighter bg-surface-light/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-yellow flex items-center justify-center text-lg">
          📊
        </div>
        <div>
          <input
            type="text"
            value={themeName}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-transparent text-lg font-bold text-text outline-none border-b border-transparent hover:border-surface-lighter focus:border-primary transition-colors w-64"
          />
          <p className="text-xs text-text-muted">Power BI Design Moodboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=0078D4&color=fff&size=32`}
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
