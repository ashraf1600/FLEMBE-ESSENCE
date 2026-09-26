import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin-dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Please fill in all fields.'); return; }
    try {
      await login(username.trim(), password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <>
      <title>Admin Login — Flembe Essence</title>
      <div className="min-h-screen bg-off-black flex items-center justify-center px-4">

        {/* Brand mark above card */}
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="font-display text-3xl text-nude tracking-widest">FLEMBE</span>
            <span className="font-display text-3xl text-rose-smoke tracking-widest ml-2">ESSENCE</span>
            <p className="font-body text-xs tracking-widest uppercase text-nude/40 mt-2">
              Admin Portal
            </p>
          </div>

          {/* Card */}
          <div className="bg-white p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-nude-dark">
              <div className="w-8 h-8 bg-burgundy flex items-center justify-center">
                <Lock size={14} className="text-nude" />
              </div>
              <div>
                <h1 className="font-display text-xl text-burgundy">Admin Login</h1>
                <p className="font-body text-xs text-off-black/50">Restricted access</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 p-3 mb-5">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="font-body text-xs text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="label" htmlFor="admin-username">Username</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-black/30" />
                  <input
                    id="admin-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="input-field pl-9"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="admin-password">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-black/30" />
                  <input
                    id="admin-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pl-9 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-off-black/30 hover:text-burgundy transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in…' : 'Sign In to Admin'}
              </button>
            </form>

            <p className="font-body text-xs text-center text-off-black/30 mt-6">
              This area is for store owners only.
            </p>
          </div>

          <div className="text-center mt-4">
            <a href="/" className="font-body text-xs tracking-widest uppercase text-nude/30 hover:text-nude/60 transition-colors">
              ← Back to store
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
