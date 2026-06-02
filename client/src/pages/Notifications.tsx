import { useEffect, useRef, useCallback, memo } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate, Link } from 'react-router-dom';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import { formatRelativeTime } from '../utils/helpers';

export default function Notifications() {
  return <NotificationListMemoized />;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'REQUEST_RECEIVED': return '📩';
    case 'REQUEST_ACCEPTED': return '✅';
    case 'REQUEST_REJECTED': return '❌';
    case 'TEAM_INVITE': return '👥';
    case 'project_match': return '🎯';
    default: return '🔔';
  }
};

const NotificationItem = memo(function NotificationItem({ n, onRead, onDelete }: { n: any; onRead: (id: string) => void; onDelete: (id: string) => void }) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (!n.read) onRead(n.id);
    const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
    if (n.type === 'project_match' && meta?.projectId) {
      navigate(`/projects/${meta.projectId}`);
    }
  }, [n, onRead, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleClick();
  }, [handleClick]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(n.id);
  }, [n.id, onDelete]);

  const getMeta = (n: any) => typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;

  return (
    <div
      key={n.id}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 cursor-pointer transition group ${
        !n.read ? 'border-l-2 border-l-[#6C4CF1]' : 'opacity-70 hover:opacity-100'
      }`}
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{getTypeIcon(n.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 dark:text-gray-200">{n.message}</p>
          {(() => {
            const meta = getMeta(n);
            return meta?.matchScore ? (
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-[8px] font-medium ${
                meta.matchScore >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                {meta.matchScore}% match
              </span>
            ) : null;
          })()}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(n.createdAt)}</p>
            <button
              onClick={handleDelete}
              className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition cursor-pointer"
              aria-label="Delete notification"
            >
              Dismiss
            </button>
          </div>
        </div>
        {!n.read && <span className="w-2 h-2 bg-[#6C4CF1] rounded-full mt-2 shrink-0" />}
      </div>
    </div>
  );
});

function NotificationList() {
  const {
    notifications, loading, fetchNotifications, markRead, markAllRead, deleteNotification,
    hasMore,
  } = useNotificationStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchNotifications(true); }, [fetchNotifications]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchNotifications(); },
      { rootMargin: '200px' }
    );
    const el = sentinelRef.current;
    if (el) obs.observe(el);
    return () => { if (el) obs.unobserve(el); };
  }, [hasMore, loading, fetchNotifications]);

  if (loading && notifications.length === 0) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="text-[#6C4CF1] hover:text-[#5538D6] text-sm">
            Mark All Read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center justify-center py-16">
            <Illustration name="bell" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">No notifications yet. We'll let you know when something arrives!</p>
          </div>
        </div>
      ) : (
        <>
          {notifications.map((n) => (
            <NotificationItem key={n.id} n={n} onRead={markRead} onDelete={deleteNotification} />
          ))}
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {loading && <p className="text-center text-sm text-gray-400 py-4">Loading more...</p>}
        </>
      )}
    </div>
  );
}

const NotificationListMemoized = memo(NotificationList);
