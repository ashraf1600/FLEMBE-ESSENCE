import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Package, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, isAdmin } = useAuth();

  // Active tab: 'details' | 'security'
  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');

  // Profile details state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || user?.first_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Password state
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  // Sync profileForm if user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || user.first_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    const errs: Record<string, string> = {};
    if (!profileForm.name.trim()) errs.name = 'Full name cannot be blank.';
    if (!profileForm.email.trim()) errs.email = 'Email address cannot be blank.';
    if (profileForm.phone.trim() && !/^01[3-9]\d{8}$/.test(profileForm.phone.trim())) {
      errs.phone = 'Please enter a valid BD phone number (e.g. 018XXXXXXXX).';
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      const data = err?.response?.data;
      if (typeof data === 'object') {
        const fieldErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setProfileErrors(fieldErrors);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErrors({});

    const errs: Record<string, string> = {};
    if (!pwForm.current_password) errs.current_password = 'Enter your current password.';
    if (!pwForm.new_password) errs.new_password = 'Enter your new password.';
    else if (pwForm.new_password.length < 6) {
      errs.new_password = 'New password must be at least 6 characters.';
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(pwForm.current_password, pwForm.new_password);
      toast.success('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to change password. Please verify current password.';
      toast.error(msg);
      setPwErrors({ current_password: msg });
    } finally {
      setPwLoading(false);
    }
  };

  const initials = (user?.name || user?.username || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <title>My Profile — Flembe Essence</title>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Top Overview Banner ─────────────────────────────────── */}
        <div className="bg-white border border-nude-dark shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-nude-dark">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-burgundy text-nude font-display text-2xl flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl text-off-black font-semibold">
                    {user?.name || user?.username}
                  </h1>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-xs ${
                    isAdmin ? 'bg-burgundy text-nude' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isAdmin ? 'Staff Admin' : 'Verified Customer'}
                  </span>
                </div>
                <p className="font-body text-xs text-off-black/60 mt-0.5">
                  @{user?.username} • {user?.email}
                </p>
                {user?.date_joined && (
                  <p className="font-body text-[11px] text-off-black/40 mt-1">
                    Member since {user.date_joined}
                  </p>
                )}
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                to="/my-orders"
                className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5"
              >
                <Package size={14} /> My Orders ({user?.orders_count ?? 0})
              </Link>
              {isAdmin && (
                <Link
                  to="/admin-dashboard"
                  className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1.5"
                >
                  <Shield size={14} /> Admin Portal
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs font-body">
            <div className="bg-nude/20 p-3.5 border border-nude-dark/60">
              <span className="text-[10px] uppercase tracking-wider text-off-black/50 block">Orders Placed</span>
              <span className="font-display text-lg text-burgundy font-bold">
                {user?.orders_count ?? 0} {user?.orders_count === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <div className="bg-nude/20 p-3.5 border border-nude-dark/60">
              <span className="text-[10px] uppercase tracking-wider text-off-black/50 block">Delivery Phone</span>
              <span className="font-medium text-off-black">
                {user?.phone ? user.phone : 'Not set yet'}
              </span>
            </div>
            <div className="bg-nude/20 p-3.5 border border-nude-dark/60">
              <span className="text-[10px] uppercase tracking-wider text-off-black/50 block">COD Status</span>
              <span className="font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> Active & Eligible
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation ─────────────────────────────────────── */}
        <div className="flex border-b border-nude-dark mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`font-body text-xs uppercase tracking-wider py-3 px-6 transition-all border-b-2 font-semibold cursor-pointer ${
              activeTab === 'details'
                ? 'border-burgundy text-burgundy bg-white'
                : 'border-transparent text-off-black/60 hover:text-off-black'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`font-body text-xs uppercase tracking-wider py-3 px-6 transition-all border-b-2 font-semibold cursor-pointer ${
              activeTab === 'security'
                ? 'border-burgundy text-burgundy bg-white'
                : 'border-transparent text-off-black/60 hover:text-off-black'
            }`}
          >
            Security & Password
          </button>
        </div>

        {/* ── Tab Content: Personal Information ────────────────────── */}
        {activeTab === 'details' && (
          <div className="bg-white border border-nude-dark shadow-sm p-6 sm:p-8">
            <h2 className="font-display text-xl text-burgundy mb-2">Update Account Details</h2>
            <p className="font-body text-xs text-off-black/60 mb-6">
              Keep your contact and delivery phone number up to date for smooth Cash on Delivery deliveries.
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-xl">
              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="profile-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <User size={15} />
                  </span>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                {profileErrors.name && <p className="text-[11px] text-red-600 mt-1 font-body">{profileErrors.name}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="profile-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Mail size={15} />
                  </span>
                  <input
                    id="profile-email"
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                {profileErrors.email && <p className="text-[11px] text-red-600 mt-1 font-body">{profileErrors.email}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="profile-phone">
                  Default Delivery Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Phone size={15} />
                  </span>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                <p className="text-[11px] text-off-black/50 mt-1 font-body">Used to pre-fill delivery confirmation at checkout.</p>
                {profileErrors.phone && <p className="text-[11px] text-red-600 mt-1 font-body">{profileErrors.phone}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1">
                  Username (Read-only System ID)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <ShieldCheck size={15} />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ''}
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/10 border border-nude-dark text-off-black/60 font-body text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {profileLoading ? 'Saving Changes…' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tab Content: Security & Password ─────────────────────── */}
        {activeTab === 'security' && (
          <div className="bg-white border border-nude-dark shadow-sm p-6 sm:p-8">
            <h2 className="font-display text-xl text-burgundy mb-2">Change Password</h2>
            <p className="font-body text-xs text-off-black/60 mb-6">
              Ensure your account is using a secure password to safeguard your order history and account details.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="current-pw">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Lock size={15} />
                  </span>
                  <input
                    id="current-pw"
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm(prev => ({ ...prev, current_password: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-10 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-off-black/40 hover:text-off-black transition-colors"
                  >
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwErrors.current_password && <p className="text-[11px] text-red-600 mt-1 font-body">{pwErrors.current_password}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="new-pw">
                  New Password (min. 6 characters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Lock size={15} />
                  </span>
                  <input
                    id="new-pw"
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm(prev => ({ ...prev, new_password: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-off-black/40 hover:text-off-black transition-colors"
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwErrors.new_password && <p className="text-[11px] text-red-600 mt-1 font-body">{pwErrors.new_password}</p>}
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-off-black uppercase tracking-wider mb-1" htmlFor="confirm-pw">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-off-black/40">
                    <Lock size={15} />
                  </span>
                  <input
                    id="confirm-pw"
                    type="password"
                    required
                    value={pwForm.confirm_password}
                    onChange={(e) => setPwForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2.5 bg-nude/20 border border-nude-dark focus:border-burgundy focus:outline-none font-body text-xs transition-colors text-off-black"
                  />
                </div>
                {pwErrors.confirm_password && <p className="text-[11px] text-red-600 mt-1 font-body">{pwErrors.confirm_password}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {pwLoading ? 'Updating Password…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </>
  );
};

export default ProfilePage;
