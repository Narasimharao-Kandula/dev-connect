import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useOnlineStore } from '../store/onlineStore';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import { formatRelativeTime } from '../utils/helpers';
import type { Conversation } from '../types';

export default function Chats() {
  const currentUser = useAuthStore((s) => s.user);
  const onlineUsers = useOnlineStore((s) => s.onlineUsers);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/conversations').then(({ data }) => { setConversations(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(q)}&type=users`);
      setSearchResults(data.users || []);
    } catch {}
    setSearching(false);
  };

  const startConversation = async (userId: string) => {
    try {
      const { data } = await api.post('/conversations', { userId });
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
      navigate(`/chat/${data.id}`);
    } catch {}
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chats</h1>
        <button
          onClick={() => setShowNewChat(!showNewChat)}
          className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-4 py-2 rounded-[12px] text-sm font-semibold shadow-lg shadow-[#6C4CF1]/20 transition"
        >
          {showNewChat ? 'Cancel' : 'New Chat'}
        </button>
      </div>

      {showNewChat && (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 mb-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users by name..."
            className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500"
            autoFocus
          />
          {searching && <p className="text-xs text-gray-400 mt-2">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-1">
              {searchResults.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C4CF1] to-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
                </button>
              ))}
            </div>
          )}
          {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">No users found.</p>
          )}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center justify-center py-12">
            <Illustration name="chat" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">No conversations yet. Send a request to start chatting!</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Send a collaboration request to start chatting</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants.find((p) => p.userId !== currentUser?.id) || conv.participants[0];
            const otherOnline = other ? onlineUsers.has(other.userId) : false;
            const lastMsg = conv.messages[0];
            return (
              <Link key={conv.id} to={`/chat/${conv.id}`} className="block bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 hover:border-gray-200 dark:hover:border-gray-600 transition" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${otherOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{other?.user?.name || 'Unknown User'}</h3>
                      {lastMsg && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{lastMsg.content}</p>
                      )}
                    </div>
                  </div>
                  {lastMsg && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatRelativeTime(lastMsg.createdAt)}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
