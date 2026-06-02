import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiCheckCircle, FiCircle } from 'react-icons/fi';

const CHECKLIST_KEY = 'devconnect_onboarding_checks';

interface ChecklistItem {
  key: string;
  label: string;
  link?: string;
}

const items: ChecklistItem[] = [
  { key: 'profile', label: 'Complete your profile', link: '/profile' },
  { key: 'discover', label: 'Discover developers', link: '/discover' },
  { key: 'project', label: 'Create a project', link: '/projects/new' },
  { key: 'chat', label: 'Start a conversation', link: '/chats' },
  { key: 'explore', label: 'Explore the feed', link: '/dashboard' },
];

function getCompleted(): string[] {
  try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '[]'); } catch { return []; }
}

function markComplete(key: string) {
  const list = [...new Set([...getCompleted(), key])];
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(list));
}

export default function OnboardingChecklist() {
  const [completed, setCompleted] = useState<string[]>(getCompleted);
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = (key: string) => {
    if (!completed.includes(key)) {
      markComplete(key);
      setCompleted([...completed, key]);
    }
  };

  const allDone = items.every((i) => completed.includes(i.key));
  if (allDone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
    >
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-between w-full cursor-pointer">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#6C4CF1]/10 flex items-center justify-center text-xs">🚀</span>
          Getting Started
          <span className="text-xs text-gray-400 font-normal">({completed.length}/{items.length})</span>
        </h3>
        <FiChevronDown size={16} className={`text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
      {!collapsed && (
        <div className="mt-3 space-y-1.5">
          {items.map((item) => {
            const done = completed.includes(item.key);
            return (
              <div key={item.key} className="flex items-center gap-2.5">
                <button onClick={() => handleToggle(item.key)} className="shrink-0 cursor-pointer" aria-label={done ? `Completed: ${item.label}` : `Mark complete: ${item.label}`}>
                  {done ? (
                    <FiCheckCircle size={16} className="text-emerald-500" />
                  ) : (
                    <FiCircle size={16} className="text-gray-300 dark:text-gray-600 hover:text-[#6C4CF1] transition-colors" />
                  )}
                </button>
                {item.link ? (
                  <a href={item.link} className={`text-sm transition-colors ${done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200 hover:text-[#6C4CF1]'}`}>
                    {item.label}
                  </a>
                ) : (
                  <span className={`text-sm ${done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
