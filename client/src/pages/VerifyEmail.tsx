import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMsg('This verification link appears to be invalid or has expired.');
      return;
    }
    api.get(`/auth/verify-email/${token}`)
      .then(() => {
        setStatus('success');
        setMsg('Your email has been verified — welcome to DevConnect!');
      })
      .catch((err) => {
        setStatus('error');
        setMsg(err.response?.data?.error || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center space-y-4 max-w-md" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        {status === 'loading' && (
          <div className="text-[#6C4CF1] text-lg font-medium">Verifying your email...</div>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 text-lg font-medium">{msg}</div>
            <Link to={user ? '/dashboard' : '/login'} className="inline-block bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 transition">
              {user ? 'Go to Dashboard' : 'Sign In'}
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 text-lg font-medium">{msg}</div>
            <Link to="/login" className="inline-block bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 transition">
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
