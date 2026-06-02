import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import SearchBar from '../ui/SearchBar';
import ThemeToggle from '../ui/ThemeToggle';
import CommandPalette from '../ui/CommandPalette';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    menuRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) hamburgerRef.current?.focus();
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/discover', label: 'Discover' },
    { to: '/projects', label: 'Projects' },
    { to: '/chats', label: 'Chats' },
    ...(user.role === 'Admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
              <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#6C4CF1] to-[#9A7DF9] flex items-center justify-center text-white text-sm font-bold shadow-sm">DC</span>
              <span className="text-lg font-bold bg-gradient-to-r from-[#6C4CF1] to-[#8B6FF7] bg-clip-text text-transparent">DevConnect</span>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3.5 py-2 rounded-[12px] text-sm font-medium transition-all ${
                    isActive(l.to)
                      ? 'bg-[#6C4CF1]/10 text-[#6C4CF1]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer"
              aria-label="Open command palette"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden lg:inline">Cmd+K</span>
            </button>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
            <Link
              to="/notifications"
              className="relative p-2.5 text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] hover:bg-[#6C4CF1]/5 rounded-[12px] transition-all"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 rounded-[14px] bg-gray-50 dark:bg-gray-800/50 hover:bg-[#6C4CF1]/5 border border-gray-100 dark:border-gray-800 hover:border-[#6C4CF1]/20 transition-all"
            >
              <span className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-[#6C4CF1] to-[#8B6FF7] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-[12px] transition-all cursor-pointer"
              title="Logout"
              aria-label="Log out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <button ref={hamburgerRef} onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-[12px] transition-all cursor-pointer" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div ref={menuRef} tabIndex={-1} className="fixed top-16 left-0 right-0 bottom-0 z-50 md:hidden bg-white dark:bg-gray-950 px-4 pt-2 pb-8 overflow-y-auto animate-fade-in">
            <div className="mb-3">
              <SearchBar />
            </div>
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                  isActive(l.to)
                    ? 'bg-[#6C4CF1]/10 text-[#6C4CF1]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/profile" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
            >
              <span className="w-6 h-6 rounded-[8px] bg-gradient-to-br from-[#6C4CF1] to-[#8B6FF7] text-white text-[10px] font-bold flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </span>
              Profile
            </Link>
          </div>
        </>
      )}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </nav>
  );
}
