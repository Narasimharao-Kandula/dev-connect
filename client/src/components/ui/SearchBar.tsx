import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';

interface UserSuggestion {
  id: string;
  name: string;
  avatar: string | null;
  country: string | null;
  availability: string | null;
}

interface ProjectSuggestion {
  id: string;
  name: string;
  status: string;
  ownerName: string;
}

interface SkillSuggestion {
  id: string;
  name: string;
  userCount: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ users: UserSuggestion[]; projects: ProjectSuggestion[]; skills: SkillSuggestion[] }>({ users: [], projects: [], skills: [] });
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 1) { setResults({ users: [], projects: [], skills: [] }); setOpen(false); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search/suggest?q=${encodeURIComponent(query)}`);
        setResults(data);
        setOpen(true);
        setSelectedIdx(-1);
      } catch { }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const totalItems = results.users.length + results.projects.length + results.skills.length;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, totalItems - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0) {
        // Navigate based on selected item
        let idx = 0;
        if (selectedIdx < results.users.length) {
          navigate(`/users/${results.users[selectedIdx].id}`);
        } else if (selectedIdx < results.users.length + results.projects.length) {
          idx = selectedIdx - results.users.length;
          navigate(`/projects/${results.projects[idx].id}`);
        } else {
          idx = selectedIdx - results.users.length - results.projects.length;
          setQuery(results.skills[idx].name);
        }
        setOpen(false);
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setOpen(false);
      }
    } else if (e.key === 'Escape') setOpen(false);
  };

  const sections: { label: string; items: any[]; key: string; icon: string; onClick: (item: any) => void }[] = [
      { label: 'Users', items: results.users, key: 'users', icon: '👤', onClick: (u) => { navigate(`/users/${u.id}`); setOpen(false); } },
    { label: 'Projects', items: results.projects, key: 'projects', icon: '📁', onClick: (p) => { navigate(`/projects/${p.id}`); setOpen(false); } },
    { label: 'Skills', items: results.skills, key: 'skills', icon: '🏷️', onClick: (s) => { setQuery(s.name); setOpen(false); } },
  ];

  let globalIdx = 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth="2" /><path strokeWidth="2" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search users, projects, skills..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6C4CF1]/20 focus:border-[#6C4CF1] transition-all"
        />
      </div>

      <AnimatePresence>
        {open && totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-black/5 overflow-hidden z-50"
          >
            {sections.map((section) => {
              if (section.items.length === 0) return null;
              const startIdx = globalIdx;
              const sectionEl = (
                <div key={section.key}>
                  <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {section.icon} {section.label}
                  </div>
                  {section.items.map((item: any) => {
                    const idx = globalIdx++;
                    const isSelected = idx === selectedIdx;
                    return (
                      <button
                        key={`${section.key}-${item.id}`}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        onClick={() => section.onClick(item)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#6C4CF1]/5 text-[#6C4CF1]' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        {section.key === 'users' && (
                          <>
                            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C4CF1] to-[#8B5CF6] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {(item as UserSuggestion).name.charAt(0).toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{(item as UserSuggestion).name}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{(item as UserSuggestion).country || 'Unknown location'}</div>
                            </div>
                            {(item as UserSuggestion).availability && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                (item as UserSuggestion).availability === 'Available' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                                (item as UserSuggestion).availability === 'LookingForTeam' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                              }`}>
                                {(item as UserSuggestion).availability}
                              </span>
                            )}
                          </>
                        )}
                        {section.key === 'projects' && (
                          <>
                            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 text-xs flex items-center justify-center flex-shrink-0">📁</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{(item as ProjectSuggestion).name}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">by {(item as ProjectSuggestion).ownerName}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              (item as ProjectSuggestion).status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            }`}>
                              {(item as ProjectSuggestion).status}
                            </span>
                          </>
                        )}
                        {section.key === 'skills' && (
                          <>
                            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 text-xs flex items-center justify-center flex-shrink-0">🏷️</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{(item as SkillSuggestion).name}</div>
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">{(item as SkillSuggestion).userCount} users</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
              globalIdx = startIdx + section.items.length;
              return sectionEl;
            })}

            <div className="border-t border-gray-50 dark:border-gray-800 px-4 py-2.5">
              <button
                onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); }}
                className="w-full text-center text-xs text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors cursor-pointer"
              >
                View all results for "<span className="font-medium">{query}</span>"
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
