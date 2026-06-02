import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { socket } from '../api/socket';
import { useAuthStore } from '../store/authStore';
import { LoadingPage } from '../components/ui/LottieLoader';
import { formatRelativeTime } from '../utils/helpers';
import type { Message, Conversation } from '../types';

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const [convRes, msgRes] = await Promise.all([
        api.get('/conversations').then((r) => r.data.find((c: Conversation) => c.id === id)),
        api.get(`/conversations/${id}/messages`),
      ]);
      setConv(convRes);
      setMessages(msgRes.data);
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    const handler = (msg: Message) => {
      if (msg.conversationId === id) setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat:receive', handler);
    return () => { socket.off('chat:receive', handler); };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    socket.emit('chat:send', { conversationId: id, content: content.trim() });
    setContent('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/upload/message', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      socket.emit('chat:send', { conversationId: id, content: `📎 ${file.name}`, attachmentUrl: data.url });
    } catch {}
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) return <LoadingPage />;
  if (!conv) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">We couldn't find this conversation.</div>;

  const other = conv.participants.find((p) => p.userId !== conv.participants[0]?.userId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 overflow-hidden flex flex-col h-[calc(100vh-12rem)]" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <Link to="/chats" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm mr-3">&larr; Back</Link>
          <span className="font-medium text-gray-900 dark:text-gray-100">{other?.user?.name || 'Chat Room'}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-[20px] px-4 py-2 ${
                msg.senderId === currentUser?.id ? 'bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}>
                <p className="text-sm break-words">{msg.content}</p>
                {msg.attachmentUrl && (
                  <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs underline mt-1 block text-white/80"
                  >
                    📎 View attachment
                  </a>
                )}
                <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>{formatRelativeTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-3 sm:p-4 flex gap-2 shrink-0">
          <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded cursor-pointer shrink-0"
            aria-label="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-[#6C4CF1] min-w-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button type="submit" className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm shrink-0">Send</button>
        </form>
      </div>
    </div>
  );
}
