import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required.';
    if (!form.username.trim()) newErrors.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_.-]+$/.test(form.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, dots, and underscores.';
    }

    if (!form.email.trim()) newErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (form.phone.trim() && !/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      newErrors.phone = 'Please enter a valid BD phone number (e.g. 018XXXXXXXX).';
    }

    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      toast.success('Registration successful! Please sign in to continue.');
      navigate('/login', {
        state: {
          from: location.state?.from,
          registeredUsername: form.username.trim(),
          registrationSuccess: true,
        },
        replace: true,
      });
    } catch (err: any) {
      const data = err?.response?.data;
      if (typeof data === 'object') {
        const fieldErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors(fieldErrors);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <>
      <title>Create Account — Flembe Essence</title>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-nude/30">
        <div className="w-full max-w-md">
          <div className="bg-white border border-nude-dark shadow-sm p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="font-display text-2xl text-burgundy tracking-widest block">FLEMBE</span>
              <span className="font-display text-xs tracking-[0.25em] text-rose-smoke uppercase block mt-0.5">
                ESSENCE
              </span>
              <h1 className="font-display text-2xl text-off-black mt-4">Create Your Account</h1>
              <p className="font-body text-xs text-off-black/60 mt-1">
                Join us for seamless shopping, order tracking, and COD delivery
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <User size={15} />
                  </span>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Nusrat Jahan"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 mt-1 font-body">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="reg-username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <ShieldCheck size={15} />
                  </span>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                {errors.username && <p className="text-[11px] text-red-600 mt-1 font-body">{errors.username}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="reg-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Mail size={15} />
                  </span>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-600 mt-1 font-body">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="reg-phone">
                  Phone Number (for Delivery)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Phone size={15} />
                  </span>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-600 mt-1 font-body">{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="reg-password">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Lock size={15} />
                  </span>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange}
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
                {errors.password && <p className="text-[11px] text-red-600 mt-1 font-body">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-burgundy hover:bg-burgundy/90 text-nude py-3 px-4 font-body text-xs uppercase tracking-widest transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Creating Account…' : 'Register Account'}
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-nude-dark text-center">
              <p className="font-body text-xs text-off-black/60">
                Already have an account?{' '}
                <Link
                  to="/login"
                  state={{ from: location.state?.from }}
                  className="text-burgundy font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
