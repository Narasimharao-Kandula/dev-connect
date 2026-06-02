import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { LoadingPage } from '../components/ui/LottieLoader';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match — please make sure both are identical.",
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user } = useAuthStore();
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // OAuth accounts
  const [accounts, setAccounts] = useState<{ provider: string; createdAt: string }[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/deletion-status')
      .then(({ data }) => setDeletionStatus(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get('/auth/accounts')
      .then(({ data }) => setAccounts(data))
      .catch(() => {})
      .finally(() => setAccountsLoading(false));
  }, []);

  const handleChangePassword = async (data: PasswordForm) => {
    try {
      await api.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      reset();
    } catch (err: any) {
      setError('currentPassword', { message: err.response?.data?.error || "We couldn't change your password. Please check your current password and try again." });
    }
  };

  const handleDelete = async () => {
    try {
      await api.post('/auth/delete-account');
      const { data: status } = await api.get('/auth/deletion-status');
      setDeletionStatus(status);
      setShowDeleteConfirm(false);
    } catch {}
  };

  const handleCancelDeletion = async () => {
    setCancelling(true);
    try {
      await api.post('/auth/cancel-deletion');
      setDeletionStatus({ scheduled: false });
    } catch {}
    setCancelling(false);
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>Email: <span className="text-gray-900 dark:text-gray-100">{user?.email}</span></p>
          <p>Name: <span className="text-gray-900 dark:text-gray-100">{user?.name}</span></p>
          <p>Member since: <span className="text-gray-900 dark:text-gray-100">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</span></p>
        </div>
        {user && !user.emailVerified && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            {verificationSent ? (
              <p className="text-amber-500 text-sm">Verification email sent! Check your inbox.</p>
            ) : (
              <button
                onClick={async () => {
                  setSendingVerification(true);
                  try {
                    await api.post('/auth/send-verification');
                    setVerificationSent(true);
                  } catch {}
                  setSendingVerification(false);
                }}
                disabled={sendingVerification}
                className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm transition disabled:opacity-50"
              >
                {sendingVerification ? 'Sending...' : 'Verify Email'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Password</h2>
        <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-3">
          <input type="password" placeholder="Current password" aria-label="Current password" {...register('currentPassword')}
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
          <input type="password" placeholder="New password (min 6 chars)" aria-label="New password" {...register('newPassword')}
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
          <input type="password" placeholder="Confirm new password" aria-label="Confirm new password" {...register('confirmPassword')}
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          <button type="submit" disabled={isSubmitting}
            className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm transition disabled:opacity-50">
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Linked Accounts</h2>
        {accountsLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading linked accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No accounts linked yet. Connect Google or GitHub to sign in faster.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.provider} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">{a.provider}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Linked {new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Preferences</h2>
        <NotificationPreferences />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Export Your Data</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data including profile, projects, messages, and notifications as a JSON file.</p>
        <button onClick={async () => { try { const { data } = await api.get('/export'); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'devconnect-export.json'; a.click(); URL.revokeObjectURL(url); } catch {} }}
          className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm transition"
        >
          Download My Data
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Blocked Users</h2>
        <BlockedUsersList />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-red-500">Delete Account</h2>
        {deletionStatus?.scheduled ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 text-sm">
              Your account is scheduled for permanent deletion in <strong>{deletionStatus.daysLeft} days</strong>.
            </p>
            <p className="text-red-500/70 text-xs mt-1">
              Scheduled date: {deletionStatus.permanentDeletionDate ? new Date(deletionStatus.permanentDeletionDate).toLocaleDateString() : 'N/A'}
            </p>
            <button
              onClick={handleCancelDeletion}
              disabled={cancelling}
              className="mt-3 bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm transition disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Deletion'}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Deleting your account will make it inactive for 30 days. During this period, you can cancel the deletion.
              After 30 days, your account and all associated data will be permanently removed.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-[12px] font-semibold text-sm transition"
            >
Request Account Deletion
            </button>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Account?"
        message="This will immediately deactivate your account. You have 30 days to cancel before permanent deletion. Your profile, projects, and conversations will be hidden during this period."
        confirmLabel="Confirm Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

function NotificationPreferences() {
  const [prefs, setPrefs] = useState<{ type: string; email: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/preferences').then(({ data }) => setPrefs(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = async (type: string, current: boolean) => {
    const { data } = await api.put('/notifications/preferences', { type, email: !current });
    setPrefs((prev) => prev.map((p) => p.type === type ? { ...p, email: data.email } : p));
  };

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  const labels: Record<string, string> = {
    collab_request: 'Collaboration Requests',
    match_found: 'Project Match Found',
    project_update: 'Project Updates',
    review_received: 'New Reviews',
    team_invite: 'Team Invites',
    follow: 'New Followers',
  };

  return (
    <div className="space-y-2">
      {prefs.map((p) => (
        <label key={p.type} className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-700 dark:text-gray-200">{labels[p.type] || p.type}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Email</span>
            <button
              onClick={() => toggle(p.type, p.email)}
              className={`w-10 h-5 rounded-full transition cursor-pointer ${p.email ? 'bg-[#6C4CF1]' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-label={`${p.email ? 'Disable' : 'Enable'} email for ${labels[p.type] || p.type}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${p.email ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </label>
      ))}
    </div>
  );
}

function BlockedUsersList() {
  const [blocked, setBlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/moderation/blocked').then(({ data }) => setBlocked(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (blockedId: string) => {
    await api.delete(`/moderation/users/${blockedId}/block`).catch(() => {});
    setBlocked((prev) => prev.filter((b) => b.blocked.id !== blockedId));
  };

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;
  if (blocked.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">You haven't blocked anyone.</p>;
  return (
    <div className="space-y-2">
      {blocked.map((b) => (
        <div key={b.blocked.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
              {b.blocked.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-200">{b.blocked.name}</span>
          </div>
          <button onClick={() => handleUnblock(b.blocked.id)} className="text-xs text-[#6C4CF1] hover:text-[#5538D6] transition-colors">Unblock</button>
        </div>
      ))}
    </div>
  );
}
