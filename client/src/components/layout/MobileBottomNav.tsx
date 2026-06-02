import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/discover', label: 'Discover', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/projects', label: 'Projects', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/chats', label: 'Chats', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/notifications', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[12px] transition-all relative ${
                isActive
                  ? 'text-[#6C4CF1]'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive ? 2 : 1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.to === '/notifications' && unreadCount > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
