import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { socket } from '../api/socket';
import { LoadingPage } from '../components/ui/LottieLoader';
import { formatRelativeTime } from '../utils/helpers';
import type { GroupMessage, Team } from '../types';

export default function TeamChat() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: project } = await api.get(`/projects/${id}`);
        const teamData = project.team;
        setTeam(teamData);
        if (teamData) {
          const { data: msgs } = await api.get(`/teams/${teamData.id}/messages`);
          setMessages(msgs);
          socket.emit('team:join', { teamId: teamData.id });
        }
      } catch {
        setError('Failed to load team chat');
      }
      setLoading(false);
    };
    load();
    return () => {
      if (team) socket.emit('team:leave', { teamId: team.id });
    };
  }, [id]);

  useEffect(() => {
    const handler = (msg: GroupMessage) => {
      if (msg.teamId === team?.id) setMessages((prev) => [...prev, msg]);
    };
    socket.on('team:receive', handler);
    return () => { socket.off('team:receive', handler); };
  }, [team?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !team) return;
    socket.emit('team:send', { teamId: team.id, content: content.trim() });
    setContent('');
  };

  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  if (loading) return <LoadingPage />;
  if (!team) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">A team hasn't been assembled for this project yet.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <Link to={`/projects/${id}`} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm mr-3">&larr; Back</Link>
            <span className="font-medium text-gray-900 dark:text-gray-100">Team Chat</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{team.members.length} members</div>
        </div>
        <div className="h-96 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                {msg.sender.name.charAt(0).toUpperCase()}
              </div>
              <div className="max-w-[70%]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{msg.sender.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 bg-gray-100 dark:bg-gray-800 rounded-[20px] px-3 py-2">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-4 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a team message..."
            className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button type="submit" className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm">Send</button>
        </form>
      </div>
    </div>
  );
}
