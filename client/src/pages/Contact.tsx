import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.post('/contact', { name, email, subject, message });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "We couldn't send your message. Please try again later.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="py-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Message sent successfully!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">We aim to respond within 24–48 hours. We'll be in touch!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back to Home</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">Contact Us</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Have a question or feedback? We'd love to hear from you.</p>
        <form onSubmit={handleSubmit} className="mt-8 bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 px-4 py-2 rounded-[12px] text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
          </div>
          <button type="submit" disabled={sending}
            className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 transition disabled:opacity-50">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
