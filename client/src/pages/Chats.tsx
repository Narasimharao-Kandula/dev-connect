import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { LoadingPage } from '../components/ui/LottieLoader';
import Illustration from '../components/ui/Illustration';
import { formatRelativeTime } from '../utils/helpers';
import type { Conversation } from '../types';

export default function Chats() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/conversations').then(({ data }) => { setConversations(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Chats</h1>
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
            const other = conv.participants.find((p) => p.userId !== conv.participants[0]?.userId) || conv.participants[0];
            const lastMsg = conv.messages[0];
            return (
              <Link key={conv.id} to={`/chat/${conv.id}`} className="block bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4 hover:border-gray-200 dark:hover:border-gray-600 transition" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{other?.user?.name || 'Unknown User'}</h3>
                    {lastMsg && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{lastMsg.content}</p>
                    )}
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
