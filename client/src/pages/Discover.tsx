import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import { getAvailabilityColor, formatRelativeTime } from '../utils/helpers';
import type { User } from '../types';

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
  const [filters, setFilters] = useState({ skill: '', country: '', search: '', remoteOnly: false, openToCollab: false });
  const debouncedFilters = useDebounced(filters, 300);

  useEffect(() => {
    const fetchUsers = async () => {
      const params = new URLSearchParams();
      if (filters.skill) params.set('skill', filters.skill);
      if (filters.country) params.set('country', filters.country);
      if (filters.search) params.set('search', filters.search);
      if (filters.remoteOnly) params.set('remoteOnly', 'true');
      if (filters.openToCollab) params.set('openToCollab', 'true');

      const { data } = await api.get(`/users?${params}`);
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [debouncedFilters]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Discover Developers</h1>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 space-y-3" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
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
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <input type="checkbox" checked={filters.remoteOnly} onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })} className="rounded text-[#6C4CF1]" />
              Remote Only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <input type="checkbox" checked={filters.openToCollab} onChange={(e) => setFilters({ ...filters, openToCollab: e.target.checked })} className="rounded text-[#6C4CF1]" />
              Open to Collaboration
            </label>
          </div>
        </div>
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
