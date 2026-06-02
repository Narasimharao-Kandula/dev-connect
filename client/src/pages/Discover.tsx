import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import { getAvailabilityColor, formatRelativeTime } from '../utils/helpers';
import type { User } from '../types';
import { FiSave, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

const SAVED_SEARCHES_KEY = 'devconnect_saved_searches';

function getSavedSearches(): { name: string; filters: any }[] {
  try { return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]'); } catch { return []; }
}

function saveSearch(name: string, filters: any) {
  const list = getSavedSearches().filter((s) => s.name !== name);
  list.unshift({ name, filters: { ...filters } });
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(list.slice(0, 10)));
}

function removeSavedSearch(name: string) {
  const list = getSavedSearches().filter((s) => s.name !== name);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(list));
}

function useDebounced(value: any, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Discover() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skill: '', country: '', search: '', remoteOnly: false, openToCollab: false, availability: '', minScore: '' });
  const [savedList, setSavedList] = useState<{ name: string; filters: any }[]>(getSavedSearches);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const debouncedFilters = useDebounced(filters, 300);

  const hasActiveFilters = filters.skill || filters.country || filters.search || filters.remoteOnly || filters.openToCollab || filters.availability || filters.minScore;

  useEffect(() => {
    const fetchUsers = async () => {
      const params = new URLSearchParams();
      if (filters.skill) params.set('skill', filters.skill);
      if (filters.country) params.set('country', filters.country);
      if (filters.search) params.set('search', filters.search);
      if (filters.remoteOnly) params.set('remoteOnly', 'true');
      if (filters.openToCollab) params.set('openToCollab', 'true');
      if (filters.availability) params.set('availability', filters.availability);
      if (filters.minScore) params.set('minScore', filters.minScore);

      const { data } = await api.get(`/users?${params}`);
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [debouncedFilters]);

  const handleSaveSearch = useCallback(() => {
    if (!saveName.trim()) return;
    saveSearch(saveName.trim(), filters);
    setSavedList(getSavedSearches());
    setSaveName('');
    setShowSaveInput(false);
    toast.success('Search saved!');
  }, [saveName, filters]);

  const handleApplySaved = useCallback((saved: { name: string; filters: any }) => {
    setFilters({ ...saved.filters });
    toast.info(`Applied "${saved.name}"`);
  }, []);

  const handleRemoveSaved = useCallback((name: string) => {
    removeSavedSearch(name);
    setSavedList(getSavedSearches());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Discover Developers</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 space-y-3" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        {savedList.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 mb-2">
            <span className="text-xs text-gray-400 self-center">Saved:</span>
            {savedList.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1 bg-[#6C4CF1]/5 text-[#6C4CF1] text-xs px-2 py-1 rounded-[8px] cursor-pointer hover:bg-[#6C4CF1]/10 transition" onClick={() => handleApplySaved(s)}>
                {s.name}
                <button onClick={(e) => { e.stopPropagation(); handleRemoveSaved(s.name); }} className="text-[#6C4CF1]/50 hover:text-red-500 cursor-pointer" aria-label={`Remove saved search ${s.name}`}>
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Search by name or skill..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <input
            placeholder="Filter by skill..."
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            className="bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <input
            placeholder="Filter by country..."
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            className="bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={filters.remoteOnly} onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })} className="rounded text-[#6C4CF1]" />
              Remote Only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={filters.openToCollab} onChange={(e) => setFilters({ ...filters, openToCollab: e.target.checked })} className="rounded text-[#6C4CF1]" />
              Open to Collab
            </label>
            <select value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]">
              <option value="">Any Availability</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="LookingForTeam">Looking for Team</option>
            </select>
            <select value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
              className="bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]">
              <option value="">Min Collaboration Score</option>
              <option value="0">0+</option>
              <option value="0.25">0.25+</option>
              <option value="0.5">0.5+</option>
              <option value="0.75">0.75+</option>
              <option value="1">1.0</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {showSaveInput ? (
              <div className="flex items-center gap-2">
                <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Search name..." className="bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[10px] px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] w-40" onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()} autoFocus />
                <button onClick={handleSaveSearch} className="text-xs bg-[#6C4CF1] text-white px-3 py-1.5 rounded-[10px] font-medium cursor-pointer">Save</button>
                <button onClick={() => { setShowSaveInput(false); setSaveName(''); }} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowSaveInput(true)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#6C4CF1] transition cursor-pointer">
                <FiSave size={14} /> Save Search
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <LoadingPage />
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center justify-center py-8">
            <Illustration name="search" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">We couldn't find any developers matching your criteria. Try adjusting your filters or search terms.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <Link key={u.id} to={`/users/${u.id}`} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-5 hover:border-gray-200 dark:hover:border-gray-600 transition" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{u.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{u.country || 'Not specified'}</p>
                </div>
                <span className={`text-xs rounded-[8px] px-2 py-0.5 border ${getAvailabilityColor(u.availability)}`}>{u.availability}</span>
              </div>
              {u.profile?.bio && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{u.profile.bio}</p>
              )}
              {u.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {u.skills.map((s) => (
                    <span key={s.skill.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-[8px]">{s.skill.name}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
                <span>{u.profile?.experience ? `${u.profile.experience}y exp` : 'Not specified'}</span>
                <span>·</span>
                <span>Active {formatRelativeTime(u.lastActive)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
