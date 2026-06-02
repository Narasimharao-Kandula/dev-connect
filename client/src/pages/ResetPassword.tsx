import { useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useErrorModalStore } from '../store/errorStore';
import { toast } from 'sonner';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const { resetPassword, loading } = useAuthStore();
  const { showModal } = useErrorModalStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      showModal('Password Mismatch', 'Passwords do not match. Please make sure both passwords are identical.');
      return;
    }
    try {
      await resetPassword(token!, password);
      setDone(true); toast.success('Password reset successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to reset password. The link may have expired.'; showModal('', msg); toast.error(msg);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <p className="text-red-600">This reset link appears to be invalid. Please request a new one below.</p>
          <Link to="/forgot-password" className="text-[#6C4CF1] hover:text-[#5538D6] text-sm mt-4 inline-block">Request a new one</Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="text-green-600 text-lg font-medium">Your password has been reset successfully!</div>
          <Link to="/login" className="inline-block bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 transition">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#6C4CF1]">DevConnect</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a new password</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 space-y-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reset Password</h2>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]"
              required
              minLength={6}
            />
            {mismatch && <p className="text-red-600 text-xs mt-1">Passwords don't match — please make sure both are identical.</p>}
          </div>
          <button
            type="submit"
            disabled={loading || mismatch}
            className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="text-[#6C4CF1] hover:text-[#5538D6]">Back to Sign In</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
