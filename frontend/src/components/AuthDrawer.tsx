import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register';

interface AuthDrawerProps {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

const AuthDrawer: React.FC<AuthDrawerProps> = ({ mode, onClose, onModeChange }) => {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const closeAfter = (path?: string) => {
    onClose();
    if (path) navigate(path);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!loginForm.username.trim() || !loginForm.password) {
      setError('Please provide both username and password.');
      return;
    }
    try {
      const user = await login(loginForm.username.trim(), loginForm.password);
      toast.success(`Welcome back, ${user.name || user.username}!`);
      closeAfter(user.is_staff && location.pathname === '/' ? '/admin-dashboard' : location.pathname);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid username or password. Please try again.');
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!registerForm.name.trim() || !registerForm.username.trim() || !registerForm.email.trim() || registerForm.password.length < 6) {
      setError('Please complete the required fields. Password must be at least 6 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await register({ ...registerForm, name: registerForm.name.trim(), username: registerForm.username.trim(), email: registerForm.email.trim() });
      toast.success('Account created. Welcome to Flembe Essence!');
      setLoginForm({ username: registerForm.username.trim(), password: '' });
      onModeChange('login');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const updateRegister = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-off-black/45 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto bg-nude shadow-2xl animate-drawer-in" onClick={event => event.stopPropagation()}>
        <div className="min-h-full px-6 py-6 sm:px-10 sm:py-8">
          <div className="flex items-center justify-between border-b border-burgundy/15 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-smoke bg-burgundy text-rose-smoke font-display text-lg">F</div>
              <div>
                <p className="font-display text-xl tracking-[0.12em] text-burgundy">FLEMBE</p>
                <p className="font-body text-[9px] uppercase tracking-[0.28em] text-rose-smoke">Essence</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close account panel" className="flex h-10 w-10 items-center justify-center rounded-full border border-burgundy/15 text-burgundy transition-colors hover:bg-burgundy hover:text-nude">
              <X size={18} />
            </button>
          </div>

          <div className="pt-10">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-smoke">{mode === 'login' ? 'Welcome back' : 'Join the circle'}</p>
            <h2 className="mt-2 font-display text-4xl leading-tight text-burgundy">{mode === 'login' ? 'Sign in to your edit.' : 'Create your account.'}</h2>
            <p className="mt-3 max-w-sm font-body text-xs leading-relaxed text-off-black/60">
              {mode === 'login' ? 'Keep your favourites close and checkout with ease.' : 'Save your details for a smoother order and delivery experience.'}
            </p>
          </div>

          <div className="mt-8 flex border-b border-burgundy/15">
            <button type="button" onClick={() => { setError(''); onModeChange('login'); }} className={`flex-1 pb-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${mode === 'login' ? 'border-b-2 border-burgundy text-burgundy' : 'text-off-black/45 hover:text-burgundy'}`}>Sign in</button>
            <button type="button" onClick={() => { setError(''); onModeChange('register'); }} className={`flex-1 pb-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${mode === 'register' ? 'border-b-2 border-burgundy text-burgundy' : 'text-off-black/45 hover:text-burgundy'}`}>Register</button>
          </div>

          {error && <div className="mt-6 border border-red-200 bg-red-50 px-3 py-2.5 font-body text-xs leading-relaxed text-red-700">{error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="mt-7 space-y-5">
              <Field icon={<User size={15} />} label="Username" value={loginForm.username} onChange={event => setLoginForm({ ...loginForm, username: event.target.value })} placeholder="Your username" />
              <PasswordField value={loginForm.password} show={showPassword} onChange={event => setLoginForm({ ...loginForm, password: event.target.value })} onToggle={() => setShowPassword(!showPassword)} />
              <SubmitButton label="Sign in" loading={isLoading} />
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-7 space-y-4">
              <Field icon={<User size={15} />} label="Full name" name="name" value={registerForm.name} onChange={updateRegister} placeholder="Your name" />
              <Field icon={<ShieldCheck size={15} />} label="Username" name="username" value={registerForm.username} onChange={updateRegister} placeholder="Choose a username" />
              <Field icon={<Mail size={15} />} label="Email address" name="email" type="email" value={registerForm.email} onChange={updateRegister} placeholder="you@example.com" />
              <Field icon={<Phone size={15} />} label="Phone for delivery" name="phone" type="tel" value={registerForm.phone} onChange={updateRegister} placeholder="01XXXXXXXXX" />
              <PasswordField value={registerForm.password} show={showPassword} onChange={event => setRegisterForm({ ...registerForm, password: event.target.value })} onToggle={() => setShowPassword(!showPassword)} />
              <SubmitButton label="Create account" loading={isLoading} />
            </form>
          )}

          <p className="mt-8 text-center font-body text-[11px] leading-relaxed text-off-black/55">
            {mode === 'login' ? 'New to Flembe Essence? ' : 'Already have an account? '}
            <button type="button" onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')} className="font-semibold text-burgundy underline underline-offset-2">
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </aside>
    </div>
  );
};

const Field: React.FC<{ icon: React.ReactNode; label: string; name?: string; type?: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }> = ({ icon, label, name, type = 'text', value, onChange, placeholder }) => (
  <label className="block">
    <span className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-off-black/75">{label}</span>
    <span className="relative block">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-burgundy/45">{icon}</span>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={label !== 'Phone for delivery'} className="w-full border border-nude-dark bg-white/70 py-3 pl-9 pr-3 font-body text-xs text-off-black outline-none transition-colors placeholder:text-off-black/35 focus:border-burgundy focus:bg-white" />
    </span>
  </label>
);

const PasswordField: React.FC<{ value: string; show: boolean; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; onToggle: () => void }> = ({ value, show, onChange, onToggle }) => (
  <label className="block">
    <span className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-off-black/75">Password</span>
    <span className="relative block">
      <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-burgundy/45" />
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="At least 6 characters" required minLength={6} className="w-full border border-nude-dark bg-white/70 py-3 pl-9 pr-10 font-body text-xs text-off-black outline-none transition-colors placeholder:text-off-black/35 focus:border-burgundy focus:bg-white" />
      <button type="button" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-off-black/40 hover:text-burgundy">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
    </span>
  </label>
);

const SubmitButton: React.FC<{ label: string; loading: boolean }> = ({ label, loading }) => (
  <button type="submit" disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 bg-burgundy px-4 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-nude shadow-lg transition-all hover:-translate-y-0.5 hover:bg-burgundy-light disabled:opacity-50">
    {loading ? 'Please wait...' : label}
    {!loading && <ArrowRight size={14} />}
  </button>
);

export default AuthDrawer;
