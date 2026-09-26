import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locState = location.state as {
    from?: { pathname: string };
    registeredUsername?: string;
    registrationSuccess?: boolean;
  } | null;

  const from = locState?.from?.pathname || '/';
  const isFromCheckout = from.includes('/checkout');
  const registeredUsername = locState?.registeredUsername || '';
  const registrationSuccess = Boolean(locState?.registrationSuccess);

  const [username, setUsername] = useState(registeredUsername);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      const user = await login(username.trim(), password);
      toast.success(`Welcome back, ${user.name || user.username}!`);

      if (user.is_staff && from === '/') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Invalid username or password. Please verify your credentials.';
      setError(msg);
    }
  };

  return (
    <>
      <title>Sign In — Flembe Essence</title>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-nude/30">
        <div className="w-full max-w-md">
          {/* Registration success notice */}
          {registrationSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
              <p className="font-body text-xs text-emerald-800 font-medium">
                Account created successfully! Please enter your password to sign in.
              </p>
            </div>
          )}

          {/* Checkout notice if redirected */}
          {isFromCheckout && !registrationSuccess && (
            <div className="mb-6 bg-burgundy/10 border border-burgundy/20 p-4 flex items-center gap-3">
              <ShoppingBag size={20} className="text-burgundy flex-shrink-0" />
              <p className="font-body text-xs text-burgundy font-medium">
                Please sign in to place your Cash on Delivery order. Your cart items are preserved.
              </p>
            </div>
          )}

          <div className="bg-white border border-nude-dark shadow-sm p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="font-display text-2xl text-burgundy tracking-widest block">FLEMBE</span>
              <span className="font-display text-xs tracking-[0.25em] text-rose-smoke uppercase block mt-0.5">
                ESSENCE
              </span>
              <h1 className="font-display text-2xl text-off-black mt-4">Welcome Back</h1>
              <p className="font-body text-xs text-off-black/60 mt-1">
                Sign in to manage your orders and checkout quickly
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-xs text-red-600 font-body">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1.5" htmlFor="login-username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <User size={15} />
                  </span>
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1.5" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Lock size={15} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-off-black/40 hover:text-off-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-burgundy hover:bg-burgundy/90 text-nude py-3 px-4 font-body text-xs uppercase tracking-widest transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Signing In…' : 'Sign In'}
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-8 pt-6 border-t border-nude-dark text-center">
              <p className="font-body text-xs text-off-black/60">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  state={{ from: location.state?.from }}
                  className="text-burgundy font-semibold hover:underline"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
