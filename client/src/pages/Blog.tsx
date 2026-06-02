import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'How to Find the Perfect Hackathon Team',
    excerpt: 'Finding the right team for a hackathon can make or break your experience. Here\'s how to use DevConnect to build a winning team.',
    date: '2026-05-15',
    author: 'DevConnect Team',
    slug: 'find-hackathon-team',
  },
  {
    title: 'Building a Portfolio That Stands Out',
    excerpt: 'Your developer portfolio is more than just a list of projects. Learn how to showcase your skills and attract the right collaborators.',
    date: '2026-05-01',
    author: 'DevConnect Team',
    slug: 'portfolio-tips',
  },
  {
    title: 'The Future of Remote Collaboration',
    excerpt: 'How distributed teams are changing the way we build software, and what tools you need to stay ahead.',
    date: '2026-04-20',
    author: 'DevConnect Team',
    slug: 'remote-collaboration',
  },
];

export default function Blog() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center">Blog</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Tips, stories, and insights from the DevConnect community.</p>
        <div className="mt-10 space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 hover:border-[#6C4CF1]/20 transition" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{post.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{post.excerpt}</p>
              <div className="flex items-center gap-3 mt-4 text-xs text-gray-400 dark:text-gray-500">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.author}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
