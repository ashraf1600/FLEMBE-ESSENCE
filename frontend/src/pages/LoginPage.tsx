import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FlembeLogo from '../components/FlembeLogo';
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

      if (user.is_staff) {
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
      <div className="min-h-[calc(100svh-5rem)] bg-nude/30 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto grid min-h-[680px] max-w-6xl overflow-hidden bg-off-black shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden min-h-[680px] overflow-hidden lg:block">
            <img src="/images/hero-jewellery.jpg" alt="Flembe Essence jewellery" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy-dark via-burgundy/40 to-off-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14 text-nude">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-rose-smoke">Your everyday edit</p>
              <h2 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[0.95]">Wear the little things that feel like you.</h2>
              <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-nude/75">Save your favourites, track every order and keep your next piece close.</p>
            </div>
          </div>

          <div className="flex items-center bg-nude px-6 py-10 sm:px-12 lg:px-14">
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

          <div className="bg-transparent">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3.5 mb-4">
                <Link to="/" title="Flembe Essence Home">
                  <FlembeLogo variant="crest" size={62} animated />
                </Link>
                <div>
                  <span className="font-display text-2xl text-burgundy tracking-[0.14em] font-bold block leading-none">FLEMBE</span>
                  <span className="font-display text-[11px] tracking-[0.25em] text-rose-smoke font-semibold uppercase block mt-1">
                    ESSENCE
                  </span>
                </div>
              </div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-rose-smoke">Welcome back</p>
              <h1 className="font-display text-3xl sm:text-4xl text-burgundy mt-2 leading-none">Sign in to your edit.</h1>
              <p className="font-body text-sm text-off-black/60 mt-2.5 leading-relaxed">
                Keep your favourites close and checkout with ease.
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
                    className="w-full pl-9 pr-3 py-3.5 bg-white/70 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-sm transition-colors text-off-black"
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
                    className="w-full pl-9 pr-10 py-3.5 bg-white/70 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-sm transition-colors text-off-black"
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
                className="w-full bg-burgundy hover:bg-burgundy-light text-nude py-3.5 px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
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

            <div className="mt-4 pt-3 text-center">
              <Link
                to="/admin-login"
                className="inline-flex items-center gap-1.5 font-body text-[11px] font-semibold text-burgundy/80 hover:text-burgundy tracking-wider uppercase transition-colors"
              >
                <Lock size={12} />
                <span>Store Administrator Login Portal →</span>
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default LoginPage;
