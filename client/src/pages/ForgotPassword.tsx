import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useErrorModalStore } from '../store/errorStore';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');
  const { forgotPassword, loading } = useAuthStore();
  const { showModal } = useErrorModalStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const resetToken = await forgotPassword(email);
      setToken(resetToken);
      setSent(true); toast.success("We've sent a reset link to your email. Please check your inbox.");
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'; showModal('', msg); toast.error(msg);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#6C4CF1]">DevConnect</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Reset your password</p>
        </div>
        {!sent ? (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 space-y-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Forgot Password</h2>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              <Link to="/login" className="text-[#6C4CF1] hover:text-[#5538D6]">Back to Sign In</Link>
            </p>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 space-y-4 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <div className="text-green-600 text-lg font-medium">Reset link sent successfully!</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              In development mode, use the token below to reset your password:
            </p>
            <div className="bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] p-3 text-xs text-gray-600 dark:text-gray-300 break-all font-mono">
              {token}
            </div>
            <Link
              to={`/reset-password/${token}`}
              className="inline-block bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 transition"
            >
              Reset Password
            </Link>
            <div>
              <Link to="/login" className="text-[#6C4CF1] hover:text-[#5538D6] text-sm">Back to Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
