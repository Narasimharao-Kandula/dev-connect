import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import Badge from '../components/ui/Badge';
import { getAvailabilityColor, formatRelativeTime } from '../utils/helpers';

interface UserResult {
  id: string; name: string; country: string | null; availability: string; lastActive: string;
  profile: { bio: string | null; experience: number | null } | null;
  skills: { skill: { id: string; name: string } }[];
  collaborationScore: number | null;
}

interface ProjectResult {
  id: string; name: string; description: string | null; status: string; createdAt: string;
  owner: { id: string; name: string };
  skills: { skill: { id: string; name: string } }[];
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const [users, setUsers] = useState<UserResult[]>([]);
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) { setLoading(false); return; }
    api.get(`/search?q=${encodeURIComponent(q)}`).then(({ data }) => {
      setUsers(data.users || []);
      setProjects(data.projects || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [q]);

  const total = users.length + projects.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/discover" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Search Results</h1>
      </div>

      <div className="flex items-center gap-3">
        <input
          defaultValue={q}
          placeholder="Search users, projects, skills..."
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) { navigate(`/search?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`); } }}
          className="flex-1 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {loading ? (
        <LoadingPage />
      ) : !q.trim() ? (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center justify-center py-8">
            <Illustration name="search" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">Enter a search term to find developers and projects.</p>
          </div>
        </div>
      ) : total === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center justify-center py-8">
            <Illustration name="search" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">No results for "<span className="font-medium text-gray-700 dark:text-gray-200">{q}</span>". Try a different search term.</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} result{total !== 1 ? 's' : ''} for "<span className="font-medium text-gray-700 dark:text-gray-200">{q}</span>"</p>

          {users.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Developers ({users.length})</h2>
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
                    {u.profile?.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{u.profile.bio}</p>}
                    {u.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {u.skills.map((s) => <span key={s.skill.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-[8px]">{s.skill.name}</span>)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
                      {u.collaborationScore != null && <><span>{Math.round(u.collaborationScore * 100)}% collab</span><span>·</span></>}
                      <span>Active {formatRelativeTime(u.lastActive)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projects ({projects.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <Link key={p.id} to={`/projects/${p.id}`} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-5 hover:border-gray-200 dark:hover:border-gray-600 transition" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
                      <Badge variant={p.status === 'Active' ? 'success' : 'default'} size="sm">{p.status}</Badge>
                    </div>
                    {p.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{p.description}</p>}
                    {p.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.skills.map((s) => <span key={s.skill.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-[8px]">{s.skill.name}</span>)}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">by {p.owner.name} · {formatRelativeTime(p.createdAt)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
