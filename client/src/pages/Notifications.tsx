import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import { formatRelativeTime } from '../utils/helpers';

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, loading, fetchNotifications, markRead, markAllRead } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

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

  const handleClick = (n: any) => {
    if (!n.read) markRead(n.id);
    const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
    if (n.type === 'project_match' && meta?.projectId) {
      navigate(`/projects/${meta.projectId}`);
    }
  };

  const getMeta = (n: any) => typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
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
        notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(n)}
            className={`bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 cursor-pointer transition ${
              !n.read ? 'border-l-2 border-l-[#6C4CF1]' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{getTypeIcon(n.type)}</span>
              <div className="flex-1">
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
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 bg-[#6C4CF1] rounded-full mt-2" />}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
