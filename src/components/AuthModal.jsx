import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, ArrowLeft } from 'lucide-react';
import { signInWithGoogle, signInWithMicrosoft, signInWithGithub, signInEmail, signUpEmail, resetPassword } from '../firebase';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('providers'); // providers | email | reset
  const [emailMode, setEmailMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleProvider = async (providerFn, name) => {
    setLoading(true);
    setError('');
    try {
      await providerFn();
      onClose();
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('popup-closed')) {
        setError('Sign-in popup was closed');
      } else if (msg.includes('account-exists-with-different-credential')) {
        setError('An account already exists with this email using a different sign-in method');
      } else {
        setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim() || `${name} sign-in failed`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (emailMode === 'signup') {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
      onClose();
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        setError('Invalid email or password');
      } else if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters');
      } else {
        setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { setError('Enter your email address'); return; }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('user-not-found')) {
        setError('No account found with this email');
      } else {
        setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-light rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-surface-lighter"
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            {mode !== 'providers' && (
              <button
                onClick={() => { setMode('providers'); setError(''); }}
                className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-text">
                {mode === 'reset' ? 'Reset Password' : mode === 'email' ? (emailMode === 'signup' ? 'Create Account' : 'Sign In') : 'Welcome'}
              </h2>
              <p className="text-xs text-text-muted">
                {mode === 'reset' ? 'We\'ll send you a reset link' : 'Sign in to save, share, and collaborate'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Provider buttons */}
        {mode === 'providers' && (
          <div className="space-y-2.5">
            {/* Microsoft — best for work emails */}
            <button
              onClick={() => handleProvider(signInWithMicrosoft, 'Microsoft')}
              disabled={loading}
              className="w-full py-3 bg-white dark:bg-surface text-gray-800 dark:text-text font-medium rounded-xl flex items-center justify-center gap-2.5 hover:bg-gray-50 dark:hover:bg-surface-lighter border border-gray-200 dark:border-surface-lighter transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              Continue with Microsoft
            </button>

            {/* Google */}
            <button
              onClick={() => handleProvider(signInWithGoogle, 'Google')}
              disabled={loading}
              className="w-full py-3 bg-white dark:bg-surface text-gray-800 dark:text-text font-medium rounded-xl flex items-center justify-center gap-2.5 hover:bg-gray-50 dark:hover:bg-surface-lighter border border-gray-200 dark:border-surface-lighter transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              onClick={() => handleProvider(signInWithGithub, 'GitHub')}
              disabled={loading}
              className="w-full py-3 bg-[#24292f] text-white font-medium rounded-xl flex items-center justify-center gap-2.5 hover:bg-[#1b1f23] transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-surface-lighter" />
              <span className="text-xs text-text-muted">or</span>
              <div className="flex-1 h-px bg-surface-lighter" />
            </div>

            {/* Email option */}
            <button
              onClick={() => setMode('email')}
              className="w-full py-3 bg-surface text-text font-medium rounded-xl flex items-center justify-center gap-2.5 hover:bg-surface-lighter border border-surface-lighter transition-colors"
            >
              <Mail size={16} />
              Continue with Email
            </button>

            {error && <p className="text-xs text-red-400 text-center mt-2">{error}</p>}
          </div>
        )}

        {/* Email form */}
        {mode === 'email' && (
          <div>
            <form onSubmit={handleEmail} className="space-y-3">
              <input
                type="email"
                placeholder="Work or personal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
              />
              <input
                type="password"
                placeholder={emailMode === 'signup' ? 'Create a password (min 6 chars)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Please wait...' : emailMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-text-muted">
                {emailMode === 'signin' ? (
                  <>No account? <button onClick={() => { setEmailMode('signup'); setError(''); }} className="text-primary hover:underline">Create one</button></>
                ) : (
                  <>Have an account? <button onClick={() => { setEmailMode('signin'); setError(''); }} className="text-primary hover:underline">Sign in</button></>
                )}
              </p>
              {emailMode === 'signin' && (
                <button
                  onClick={() => { setMode('reset'); setError(''); }}
                  className="text-xs text-text-muted hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </div>
        )}

        {/* Password reset */}
        {mode === 'reset' && (
          <div>
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Mail size={20} className="text-green-500" />
                </div>
                <p className="text-sm font-medium text-text mb-1">Check your email</p>
                <p className="text-xs text-text-muted mb-4">
                  We sent a password reset link to <span className="font-medium text-text">{email}</span>
                </p>
                <button
                  onClick={() => { setMode('email'); setResetSent(false); }}
                  className="text-xs text-primary hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-[10px] text-text-muted text-center mt-4">
          By signing in, you agree to our Terms of Service
        </p>
      </motion.div>
    </motion.div>
  );
}
