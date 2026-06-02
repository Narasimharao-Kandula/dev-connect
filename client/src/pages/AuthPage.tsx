import { useState, type FormEvent, useCallback, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useErrorModalStore } from '../store/errorStore';
import { toast } from 'sonner';
import Illustration from '../components/ui/Illustration';
import api from '../api/client';
import type { PlatformStats } from '../types';

type Mode = 'signin' | 'signup';

const spring = { stiffness: 400, damping: 30 as const };

function FloatInput({ label, id, type, value, onChange, required }: any) {
  const [focused, setFocused] = useState(false);
  const active = focused || value;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="peer w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-4 pt-6 pb-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-transparent focus:outline-none focus:border-[#6C4CF1] focus:bg-white dark:focus:bg-gray-900 transition-all duration-200"
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          active ? 'top-1.5 text-[10px] text-[#6C4CF1] font-medium' : 'top-4 text-sm text-gray-400 dark:text-gray-500'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

function PassInput({ label, id, value, onChange, required }: any) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = focused || value;
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="peer w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-4 pt-6 pb-2.5 pr-12 text-sm text-gray-900 dark:text-gray-100 placeholder-transparent focus:outline-none focus:border-[#6C4CF1] focus:bg-white dark:focus:bg-gray-900 transition-all duration-200"
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          active ? 'top-1.5 text-[10px] text-[#6C4CF1] font-medium' : 'top-4 text-sm text-gray-400'
        }`}
      >
        {label}
      </label>
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs font-medium cursor-pointer transition-colors">
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/10">
      <div className="text-white text-lg font-bold">{value}</div>
      <div className="text-white/60 text-[10px] tracking-wide">{label}</div>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, loading, loadUser } = useAuthStore();
  const { showModal } = useErrorModalStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('oauth_error');
    if (oauthError) {
      showModal('OAuth Error', oauthError);
      navigate('/login', { replace: true });
    } else if (token) {
      localStorage.setItem('token', token);
      loadUser().then(() => navigate('/dashboard', { replace: true }));
    }
  }, []);

  const [sEmail, setSEmail] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uConfirm, setUConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const toggle = useCallback((m: Mode) => setMode(m), []);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    try { await login(sEmail, sPassword); navigate('/dashboard'); }
    catch (err: any) { const msg = err.response?.data?.error || 'Login failed. Please try again.'; showModal('', msg); toast.error(msg); }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (uPassword !== uConfirm) {
      showModal('Password Mismatch', 'Passwords do not match. Please make sure both passwords are identical.');
      return;
    }
    try { await register(uName, uEmail, uPassword); navigate('/dashboard'); }
    catch (err: any) { const msg = err.response?.data?.error || 'Registration failed. Please try again.'; showModal('', msg); toast.error(msg); }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fc] dark:bg-[#0f0f1a] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden flex flex-col md:flex-row"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.06)' }}
      >
        {/* Left — Brand */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#6C4CF1] via-[#8B5CF6] to-[#A78BFA] p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-[12px] flex items-center justify-center">
                <span className="text-white text-lg font-bold">DC</span>
              </div>
              <span className="text-white text-xl font-bold tracking-tight">DevConnect</span>
            </motion.div>
            <div className="flex-1 flex flex-col justify-center -mt-8">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-white/60 text-xs tracking-[0.2em] uppercase mb-8">
                Build &bull; Collaborate &bull; Grow
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white text-3xl lg:text-4xl font-bold leading-tight">
                Welcome to<br />DevConnect
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-white/70 text-sm mt-4 leading-relaxed max-w-sm">
                Connect with talented developers, build amazing teams, launch innovative projects, and grow your career together.
              </motion.p>
              <div className="flex items-center justify-center my-6">
                <div className="w-40 h-36">
                  <Illustration name="team" />
                </div>
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-2 mt-8">
                {['Find Developers', 'Build Teams', 'Collaborate', 'Launch Projects', 'Hackathons', 'Startup Ideas'].map((chip) => (
                  <span key={chip} className="inline-block px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-[11px] rounded-full border border-white/10">
                    ✓ {chip}
                  </span>
                ))}
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-4">
              {statsLoading ? (
                <>
                  <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/10">
                    <div className="shimmer-bg h-5 w-12 mx-auto mb-1 rounded" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                    <div className="shimmer-bg h-3 w-14 mx-auto rounded" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/10">
                    <div className="shimmer-bg h-5 w-12 mx-auto mb-1 rounded" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                    <div className="shimmer-bg h-3 w-14 mx-auto rounded" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/10">
                    <div className="shimmer-bg h-5 w-12 mx-auto mb-1 rounded" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                    <div className="shimmer-bg h-3 w-14 mx-auto rounded" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                  </div>
                </>
              ) : stats ? (
                <>
                  <StatCard value={`${stats.totalUsers.toLocaleString()}+`} label="Developers" />
                  <StatCard value={`${stats.totalProjects.toLocaleString()}+`} label="Projects" />
                  <StatCard value={`${stats.totalCountries}+`} label="Countries" />
                </>
              ) : null}
            </motion.div>
          </div>
        </div>

        {/* Right — Auth Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {mode === 'signin' ? 'Enter your credentials to continue' : 'Start your journey with DevConnect'}
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-[16px] p-1.5 flex w-64">
                <motion.div
                  layoutId="auth-tab-bg"
                  className="absolute inset-y-1.5 w-1/2 rounded-[12px] bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] shadow-md shadow-[#6C4CF1]/20"
                  animate={{ x: mode === 'signin' ? '0%' : '100%' }}
                  transition={{ type: 'spring', ...spring }}
                />
                {(['signin', 'signup'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => toggle(m)}
                    className={`relative z-10 w-1/2 py-2.5 text-sm font-medium rounded-[12px] transition-colors duration-200 cursor-pointer ${
                      mode === m ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'signin' ? (
                <motion.form key="signin"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn} className="space-y-4"
                >
                  <FloatInput label="Email Address" id="s-email" type="email" value={sEmail} onChange={(e: any) => setSEmail(e.target.value)} required />
                  <PassInput label="Password" id="s-pass" value={sPassword} onChange={(e: any) => setSPassword(e.target.value)} required />
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#6C4CF1] focus:ring-[#6C4CF1]/30" />
                      <span className="text-gray-500 dark:text-gray-400">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-[#6C4CF1] hover:text-[#8B5CF6] font-medium transition-colors text-sm">
                      Forgot password?
                    </Link>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white font-semibold py-3 rounded-[14px] text-sm shadow-lg shadow-[#6C4CF1]/20 hover:shadow-xl hover:shadow-[#6C4CF1]/30 transition-all duration-200 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Signing you in...
                      </span>
                    ) : 'Sign In'}
                  </button>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800" /></div>
                    <div className="relative flex justify-center"><span className="bg-white dark:bg-gray-900 px-4 text-xs text-gray-400 dark:text-gray-500">OR CONTINUE WITH</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Google', 'GitHub'].map((p) => (
                      <a key={p} href={`/api/auth/${p.toLowerCase()}`}
                        className="flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
                      >
                        {p === 'Google' ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        )}
                        {p}
                      </a>
                    ))}
                  </div>
                </motion.form>
              ) : (
                <motion.form key="signup"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp} className="space-y-4"
                >
                  <FloatInput label="Full Name" id="u-name" type="text" value={uName} onChange={(e: any) => setUName(e.target.value)} required />
                  <FloatInput label="Email" id="u-email" type="email" value={uEmail} onChange={(e: any) => setUEmail(e.target.value)} required />
                  <PassInput label="Password" id="u-pass" value={uPassword} onChange={(e: any) => setUPassword(e.target.value)} required />
                  <PassInput label="Confirm Password" id="u-confirm" value={uConfirm} onChange={(e: any) => setUConfirm(e.target.value)} required />
                  {uConfirm && uPassword !== uConfirm && <p className="text-red-500 text-xs -mt-2">Passwords don't match — please make sure both are identical.</p>}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-[#6C4CF1] focus:ring-[#6C4CF1]/30" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">I agree to the <span className="text-[#6C4CF1] font-medium">Terms of Service</span> and <span className="text-[#6C4CF1] font-medium">Privacy Policy</span></span>
                  </label>
                  <button type="submit" disabled={loading || !agree || (uConfirm !== '' && uPassword !== uConfirm)}
                    className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white font-semibold py-3 rounded-[14px] text-sm shadow-lg shadow-[#6C4CF1]/20 hover:shadow-xl hover:shadow-[#6C4CF1]/30 transition-all duration-200 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Creating your account...
                      </span>
                    ) : 'Create Account'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
