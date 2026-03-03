import { motion, AnimatePresence } from 'framer-motion';

const MAX_VISIBLE = 5;

export default function PresenceAvatars({ users = [], currentUserId }) {
  // Filter out current user, show others
  const others = users.filter(u => u.uid !== currentUserId);
  if (others.length === 0) return null;

  const visible = others.slice(0, MAX_VISIBLE);
  const overflow = others.length - MAX_VISIBLE;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        <AnimatePresence>
          {visible.map((user) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, scale: 0.5, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -8 }}
              className="relative"
              title={user.displayName || user.email}
            >
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || '?')}&background=0078D4&color=fff&size=28`}
                alt={user.displayName || ''}
                className="w-7 h-7 rounded-full border-2 border-surface-light"
              />
              {/* Green active dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-light" />
            </motion.div>
          ))}
        </AnimatePresence>

        {overflow > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-surface-light bg-surface-lighter flex items-center justify-center">
            <span className="text-[10px] font-bold text-text-muted">+{overflow}</span>
          </div>
        )}
      </div>

      {others.length > 0 && (
        <span className="ml-2 text-xs text-text-muted hidden sm:block">
          {others.length === 1
            ? `${others[0].displayName || 'Someone'} is editing`
            : `${others.length} collaborators`
          }
        </span>
      )}
    </div>
  );
}
