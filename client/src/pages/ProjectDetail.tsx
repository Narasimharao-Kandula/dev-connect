import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { LoadingPage } from '../components/ui/LottieLoader';
import { getStatusColor, formatDate } from '../utils/helpers';
import KanbanBoard from '../components/forms/KanbanBoard';
import type { Project } from '../types';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [matchingDevs, setMatchingDevs] = useState<any[]>([]);
  const [teamRec, setTeamRec] = useState<any>(null);
  const [showTeamRec, setShowTeamRec] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get('/bookmarks').catch(() => ({ data: [] })),
      api.get(`/tasks/${id}`).catch(() => ({ data: [] })),
      api.get(`/match/projects/${id}/developers`).catch(() => ({ data: [] })),
    ]).then(([projRes, bmRes, taskRes, matchRes]) => {
      setProject(projRes.data);
      setBookmarked(bmRes.data.some((b: any) => b.projectId === id));
      setTasks(taskRes.data);
      setMatchingDevs(matchRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const toggleBookmark = async () => {
    const { data } = await api.post(`/bookmarks/${id}`);
    setBookmarked(data.bookmarked);
  };

  const handleCreateTeam = async () => {
    setTeamLoading(true);
    try {
      await api.post(`/projects/${id}/team`);
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {}
    setTeamLoading(false);
  };

  if (loading) return <LoadingPage />;
    if (!project) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">We couldn't find this project. It may have been removed.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              by {project.owner.name} · {formatDate(project.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleBookmark} className={`text-xl ${bookmarked ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'}`} title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
              {bookmarked ? '★' : '☆'}
            </button>
            <span className={`text-xs px-3 py-1 rounded-[8px] font-medium ${getStatusColor(project.status)}`}>{project.status}</span>
          </div>
        </div>
        {project.description && <p className="text-gray-600 dark:text-gray-300 mt-4">{project.description}</p>}
        {project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.skills.map((s) => (
              <span key={s.skill.id} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-[8px] text-sm">{s.skill.name}</span>
            ))}
          </div>
        )}
      </div>

      {project.team && (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team</h2>
            {project.team.projectId && (
              <Link to={`/projects/${project.id}/team`} className="text-[#6C4CF1] hover:text-[#5538D6] text-sm">Group Chat</Link>
            )}
          </div>
          <div className="space-y-3">
            {project.team.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2">
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{m.user.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{m.role}</span>
                </div>
                {m.user.id === project.ownerId && <span className="text-xs text-amber-500">Owner</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {!project.team && (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No team has been assembled for this project yet.</p>
          <button onClick={handleCreateTeam} disabled={teamLoading}
            className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-6 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm disabled:opacity-50">
            {teamLoading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      )}

      {matchingDevs.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Matching Developers</h2>
          <div className="space-y-2">
            {matchingDevs.slice(0, 5).map((dev) => (
              <Link key={dev.userId} to={`/users/${dev.userId}`} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">{dev.name.charAt(0)}</div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-200">{dev.name}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {dev.matchedSkills?.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-[8px]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-medium ${dev.matchScore >= 80 ? 'text-emerald-600' : dev.matchScore >= 50 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {dev.matchScore}%
                </span>
              </Link>
            ))}
          </div>
          {!project.team && currentUser?.id === project.ownerId && (
            <button onClick={async () => {
              setShowTeamRec(!showTeamRec);
              if (!showTeamRec) {
                try {
                  const { data } = await api.get(`/match/projects/${id}/team-recommendation`);
                  setTeamRec(data);
                } catch {}
              }
            }} className="mt-4 text-[#6C4CF1] hover:text-[#5538D6] text-sm">
              {showTeamRec ? 'Hide' : 'Auto-Build Team'}
            </button>
          )}
          {showTeamRec && teamRec && (
            <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Recommended Team</h3>
              <div className="space-y-2">
                {teamRec.recommendedTeam?.map((dev: any) => (
                  <Link key={dev.userId} to={`/users/${dev.userId}`} className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-600 transition">
                    <div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{dev.name}</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {dev.matchedSkills?.map((s: string) => (
                          <span key={s} className="text-xs bg-[#6C4CF1]/10 text-[#6C4CF1] border border-[#6C4CF1]/20 px-1.5 py-0.5 rounded-[8px]">{s}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{dev.matchScore}% · Score: {Math.round(dev.collaborationScore * 100)}</span>
                  </Link>
                ))}
              </div>
              {teamRec.missingSkills?.length > 0 && (
                <p className="text-xs text-amber-500">Still needed: {teamRec.missingSkills.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tasks ({tasks.length})</h2>
        <KanbanBoard
          tasks={tasks}
          projectId={id!}
          isOwner={!!(currentUser && currentUser.id === project.ownerId)}
          onRefresh={async () => {
            const { data } = await api.get(`/tasks/${id}`);
            setTasks(data);
          }}
        />
      </div>
    </div>
  );
}
