import { useState } from 'react';
import api from '../../api/client';

interface Props {
  receiverId: string;
  receiverName: string;
  onClose: () => void;
}

export default function SendRequestModal({ receiverId, receiverName, onClose }: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      await api.post('/requests', { receiverId, message: message || undefined });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 w-full max-w-md mx-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        {sent ? (
          <div className="text-center">
            <div className="text-green-600 text-lg mb-2">Request Sent!</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Your collaboration request has been sent to {receiverName}</p>
            <button onClick={onClose} className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm cursor-pointer">Close</button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Send Request to {receiverName}</h3>
            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-3 py-2 rounded-[14px] text-sm mb-4">{error}</div>}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)..."
              rows={3}
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#6C4CF1] mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-4 py-2 text-sm cursor-pointer">Cancel</button>
              <button onClick={handleSend} disabled={sending}
                className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm disabled:opacity-50 cursor-pointer">
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
