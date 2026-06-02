import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import { getStatusColor } from '../utils/helpers';
import type { Project } from '../types';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(({ data }) => { setProjects(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
        </div>
        <Link to="/projects/new" className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm transition">
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center justify-center py-16">
            <Illustration name="search" />
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-4">No projects have been created yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-5 hover:border-gray-200 dark:hover:border-gray-600 transition" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{p.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-[8px] font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
              </div>
              {p.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{p.description}</p>}
              {p.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {p.skills.map((s) => (
                    <span key={s.skill.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-[8px]">{s.skill.name}</span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                Owner: {p.owner.name} · {p.team ? `${p.team.members.length} members` : 'No team assigned'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
