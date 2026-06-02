import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { FiSearch, FiHome, FiUsers, FiFolder, FiMessageSquare, FiBell, FiSettings, FiUser, FiGrid, FiPlus } from 'react-icons/fi';

const pages = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard', keywords: 'home main' },
  { icon: FiGrid, label: 'Discover', path: '/discover', keywords: 'explore browse find' },
  { icon: FiUsers, label: 'Profile', path: '/profile', keywords: 'me account' },
  { icon: FiFolder, label: 'Projects', path: '/projects', keywords: 'list all' },
  { icon: FiPlus, label: 'New Project', path: '/projects/new', keywords: 'create add' },
  { icon: FiMessageSquare, label: 'Chats', path: '/chats', keywords: 'messages inbox' },
  { icon: FiBell, label: 'Notifications', path: '/notifications', keywords: 'alerts' },
  { icon: FiSettings, label: 'Settings', path: '/settings', keywords: 'preferences config' },
  { icon: FiUser, label: 'Admin Dashboard', path: '/admin', keywords: 'admin manage' },
];

export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const runCommand = useCallback((path: string) => {
    onOpenChange(false);
    navigate(path);
  }, [navigate, onOpenChange]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <div
      className={`fixed inset-0 z-[200] ${open ? 'visible' : 'invisible'}`}
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="bg-white dark:bg-gray-900 rounded-[20px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-in">
          <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800">
            <FiSearch className="text-gray-400 shrink-0" size={18} />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages..."
              className="w-full py-4 text-sm text-gray-900 dark:text-gray-100 bg-transparent outline-none placeholder:text-gray-400"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-[6px] font-mono">ESC</kbd>
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-400">
              No results found.
            </Command.Empty>
            <Command.Group heading="Pages" className="text-[11px] text-gray-400 font-medium px-2 pt-3 pb-1">
              {pages.map((p) => (
                <Command.Item
                  key={p.path}
                  value={`${p.label} ${p.keywords}`}
                  onSelect={() => runCommand(p.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm text-gray-700 dark:text-gray-200 cursor-pointer data-[selected=true]:bg-[#6C4CF1]/10 data-[selected=true]:text-[#6C4CF1] transition-colors"
                >
                  <p.icon size={16} className="text-gray-400 shrink-0" />
                  {p.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
