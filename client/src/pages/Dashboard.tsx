import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import api from '../api/client';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import OnboardingChecklist from '../components/OnboardingChecklist';
import OnboardingTour, { useOnboarding } from '../components/OnboardingTour';
import { getAvailabilityColor, getStatusColor, formatRelativeTime } from '../utils/helpers';
import type { Project, CollaborationRequest } from '../types';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { notifications, fetchNotifications } = useNotificationStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<any[]>([]);
  const [showTour, setShowTour] = useState(false);
  const { tourCompleted, completeTour } = useOnboarding();

  useEffect(() => {
    const load = async () => {
      const [projRes, reqRes, feedRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/requests/received').catch(() => ({ data: [] })),
        api.get('/feed').catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data);
      setRequests(reqRes.data);
      setFeed(feedRes.data);
      await fetchNotifications();
      setLoading(false);
    };
    load();
  }, [fetchNotifications]);

  if (loading) return <LoadingPage />;

  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 md:p-8 border border-gray-100/80 dark:border-gray-800/80" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {user?.name}
              </h1>
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${getAvailabilityColor(user?.availability || '')} bg-opacity-10`}>
                {user?.availability}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your projects and collaborations.</p>
          </div>
          <div className="flex items-center gap-2">
            {!tourCompleted && (
              <button onClick={() => setShowTour(true)} className="px-4 py-2 text-sm font-medium bg-[#6C4CF1]/10 text-[#6C4CF1] rounded-[12px] hover:bg-[#6C4CF1]/20 transition cursor-pointer">
                Take Tour
              </button>
            )}
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[12px] text-sm font-semibold transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <OnboardingChecklist />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard label="Projects" value={projects.length} icon="📁" color="#6C4CF1" />
        <StatCard label="Pending Requests" value={pendingRequests.length} icon="📩" color="#F59E0B" />
        <StatCard label="Unread Notifications" value={unreadNotifications} icon="🔔" color="#10B981" />
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100/80 dark:border-gray-800/80" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activity Feed</h2>
          {feed.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{feed.length} updates</span>
          )}
        </div>
        {feed.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-[14px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 text-xl">📭</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No recent activity yet. Start collaborating to see updates here!</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Activity will appear here as you collaborate</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
            {feed.map((item: any, i: number) => (
              <div key={`${item.type}-${i}`} className="flex items-start gap-3.5 py-3 px-4 rounded-[14px] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {item.type === 'new_user' && (
                  <><span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0">+</span>
                    <div><Link to={`/users/${item.user.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.user.name}</Link><span className="text-gray-500 dark:text-gray-400"> joined DevConnect</span><p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(item.createdAt)}</p></div>
                  </>
                )}
                {item.type === 'new_project' && (
                  <><span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0">P</span>
                    <div><Link to={`/projects/${item.project.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.project.name}</Link><span className="text-gray-500 dark:text-gray-400"> created by </span><Link to={`/users/${item.project.owner.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.project.owner.name}</Link><p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(item.createdAt)}</p></div>
                  </>
                )}
                {item.type === 'collaboration_accepted' && (
                  <><span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0">🤝</span>
                    <div><Link to={`/users/${item.sender.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.sender.name}</Link><span className="text-gray-500 dark:text-gray-400"> and </span><Link to={`/users/${item.receiver.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.receiver.name}</Link><span className="text-gray-500 dark:text-gray-400"> started collaborating</span><p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(item.createdAt)}</p></div>
                  </>
                )}
                {item.type === 'new_review' && (
                  <><span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0">★</span>
                    <div><Link to={`/users/${item.review.reviewer.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.review.reviewer.name}</Link><span className="text-gray-500 dark:text-gray-400"> reviewed </span><Link to={`/users/${item.review.reviewed.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.review.reviewed.name}</Link>{item.review.project && <span className="text-gray-500 dark:text-gray-400"> on {item.review.project.name}</span>}<p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(item.createdAt)}</p></div>
                  </>
                )}
                {item.type === 'recommended_project' && (
                  <><span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0">★</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/projects/${item.project.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.project.name}</Link>
                        <Badge variant="success" size="sm">{item.matchScore}% match</Badge>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Recommended for your skills</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.matchedSkills?.map((s: string) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C4CF1]/5 text-[#6C4CF1] font-medium">{s}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  </>
                )}
                {item.type === 'top_collaborator' && (
                  <><span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0">🏆</span>
                    <div className="flex-1">
                      <Link to={`/users/${item.user.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#6C4CF1]">{item.user.name}</Link>
                      <span className="text-gray-500 dark:text-gray-400"> — Top Collaborator</span>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Score: <span className="font-medium text-gray-700 dark:text-gray-200">{Math.round((item.user.collaborationScore || 0) * 100)}%</span></span>
                        <span>Response: <span className="font-medium text-gray-700 dark:text-gray-200">{Math.round((item.user.responseRate || 0) * 100)}%</span></span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Projects</h2>
            <Link to="/projects/new" className="text-sm text-[#6C4CF1] hover:text-[#5538D6] font-medium transition-colors">
              + New
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-[20px] p-8 text-center border border-gray-100/80 dark:border-gray-800/80" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <div className="flex flex-col items-center justify-center py-12">
                <Illustration name="folder" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-4">You haven't created any projects yet.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first project to get started</p>
              </div>
              <Link to="/projects/new" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C4CF1]/10 text-[#6C4CF1] rounded-[10px] text-sm font-medium hover:bg-[#6C4CF1]/20 transition-colors">
                Create Project
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-[16px] p-4 border border-gray-100/80 dark:border-gray-800/80 card-hover transition-all"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
                  </div>
                  {p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.skills.map((s) => (
                        <span key={s.skill.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">{s.skill.name}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Notifications</h2>
            <Link to="/notifications" className="text-sm text-[#6C4CF1] hover:text-[#5538D6] font-medium transition-colors">
              View all
            </Link>
          </div>
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-[20px] p-8 text-center border border-gray-100/80 dark:border-gray-800/80" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <div className="flex flex-col items-center justify-center py-12">
                <Illustration name="bell" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-4">No notifications yet. You're all caught up!</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You're all caught up</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.slice(0, 5).map((n) => (
                <Link key={n.id} to="/notifications"
                  className={`block bg-white dark:bg-gray-900 rounded-[16px] p-4 border card-hover transition-all ${
                    !n.read ? 'border-l-4 border-l-[#6C4CF1] border-gray-100/80 dark:border-gray-800/80' : 'border-gray-100/80 dark:border-gray-800/80'
                  }`}
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(n.createdAt)}</p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CF1]" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      {showTour && <OnboardingTour onComplete={() => { completeTour(); setShowTour(false); }} />}
    </motion.div>
  );
}
