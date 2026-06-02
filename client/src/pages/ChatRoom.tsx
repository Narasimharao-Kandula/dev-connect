import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { socket } from '../api/socket';
import { useAuthStore } from '../store/authStore';
import { useOnlineStore } from '../store/onlineStore';
import { LoadingPage } from '../components/ui/LottieLoader';
import { formatRelativeTime } from '../utils/helpers';
import type { Message, Conversation } from '../types';

const TYPING_TIMEOUT = 2000;

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3).replace(/^\w+\n/, '');
      return <pre key={i} className="text-xs bg-gray-900 text-green-400 rounded-[10px] p-3 my-1.5 overflow-x-auto font-mono leading-relaxed"><code>{code}</code></pre>;
    }
    return <span key={i}>{part}</span>;
  });
}

const MessageBubble = memo(function MessageBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-[20px] px-4 py-2 ${
        isOwn ? 'bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }`}>
        <div className="text-sm break-words">{renderContent(msg.content)}</div>
        {msg.attachmentUrl && (
          <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs underline mt-1 block text-white/80"
          >
            📎 View attachment
          </a>
        )}
        <div className="flex items-center gap-1 mt-1">
          <p className={`text-xs ${isOwn ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>{formatRelativeTime(msg.createdAt)}</p>
          {isOwn && (
            <span className={`text-[10px] ${msg.read ? 'text-blue-300' : 'text-white/40'}`}>{msg.read ? '✓✓' : '✓'}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const onlineUsers = useOnlineStore((s) => s.onlineUsers);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = useCallback(() => {
    socket.emit('chat:typing', { conversationId: id });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('chat:stop-typing', { conversationId: id });
    }, TYPING_TIMEOUT);
  }, [id]);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const { data: allConvs } = await api.get('/conversations');
        const found = allConvs.find((c: Conversation) => c.id === id);
        setConv(found || null);
      } catch {}
    };
    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/conversations/${id}/messages`);
        setMessages(data.messages || data);
        setNextCursor(data.nextCursor || null);
      } catch {}
      setLoading(false);
    };
    socket.emit('chat:join', { conversationId: id });
    socket.emit('messages:read', { conversationId: id });
    Promise.all([loadConversation(), loadMessages()]);
    return () => {
      socket.emit('chat:leave', { conversationId: id });
    };
  }, [id]);

  useEffect(() => {
    const handler = (msg: Message) => {
      if (msg.conversationId === id) setMessages((prev) => [...prev, msg]);
    };
    const typingHandler = ({ userId }: { userId: string }) => {
      if (userId !== currentUser?.id) setTypingUsers((prev) => new Set(prev).add(userId));
    };
    const stopTypingHandler = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    };
    socket.on('chat:receive', handler);
    socket.on('chat:typing', typingHandler);
    socket.on('chat:stop-typing', stopTypingHandler);
    return () => {
      socket.off('chat:receive', handler);
      socket.off('chat:typing', typingHandler);
      socket.off('chat:stop-typing', stopTypingHandler);
    };
  }, [id, currentUser?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/conversations/${id}/messages?cursor=${nextCursor}`);
      const older = (data.messages || data).filter((m: Message) => !messages.some((e) => e.id === m.id));
      setMessages((prev) => [...older, ...prev]);
      setNextCursor(data.nextCursor || null);
    } catch {}
    setLoadingMore(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    socket.emit('chat:send', { conversationId: id, content: content.trim() });
    setContent('');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socket.emit('chat:stop-typing', { conversationId: id });
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

  const other = conv.participants.find((p) => p.userId !== currentUser?.id);
  const otherOnline = other ? onlineUsers.has(other.userId) : false;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 overflow-hidden flex flex-col h-[calc(100vh-12rem)]" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-2">
          <Link to="/chats" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm mr-3">&larr; Back</Link>
          <span className={`w-2 h-2 rounded-full ${otherOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
          <span className="font-medium text-gray-900 dark:text-gray-100">{other?.user?.name || 'Chat Room'}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {nextCursor && (
            <div className="text-center">
              <button onClick={loadMore} disabled={loadingMore} className="text-xs text-[#6C4CF1] hover:text-[#5538D6] font-medium transition cursor-pointer">
                {loadingMore ? 'Loading...' : 'Load older messages'}
              </button>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isOwn={msg.senderId === currentUser?.id} />
          ))}
          {typingUsers.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 animate-pulse">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              Typing...
            </div>
          )}
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
          <button type="button" onClick={() => setContent((prev) => prev + '```\n// your code here\n``` ')} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded cursor-pointer shrink-0" aria-label="Insert code block">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          <input
            type="text"
            value={content}
            onChange={(e) => { setContent(e.target.value); emitTyping(); }}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-[#6C4CF1] min-w-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button type="submit" className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm shrink-0">Send</button>
        </form>
      </div>
    </div>
  );
}
