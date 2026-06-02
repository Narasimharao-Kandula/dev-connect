import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#6C4CF1] to-[#9A7DF9] flex items-center justify-center text-white text-sm font-bold shadow-sm">DC</span>
              <span className="text-lg font-bold bg-gradient-to-r from-[#6C4CF1] to-[#8B6FF7] bg-clip-text text-transparent">DevConnect</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to}
                  className={`px-3.5 py-2 rounded-[12px] text-sm font-medium transition-all ${
                    isActive(l.to) ? 'bg-[#6C4CF1]/10 text-[#6C4CF1]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/login" className="hidden md:inline-flex text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3.5 py-2 rounded-[12px] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                Log in
              </Link>
              <Link to="/register"
                className="inline-flex items-center bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2 rounded-[12px] text-sm font-semibold shadow-md shadow-[#6C4CF1]/20 hover:shadow-lg hover:shadow-[#6C4CF1]/30 transition-all"
              >
                Sign Up
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-[12px] transition-all cursor-pointer" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 pb-4 pt-2 space-y-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                    isActive(l.to) ? 'bg-[#6C4CF1]/10 text-[#6C4CF1]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="px-3 pt-1 pb-2">
                <ThemeToggle />
              </div>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-[12px] text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </nav>
      <main><Outlet /></main>
      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#6C4CF1] to-[#9A7DF9] flex items-center justify-center text-white text-sm font-bold shadow-sm">DC</span>
              <span className="text-lg font-bold bg-gradient-to-r from-[#6C4CF1] to-[#8B6FF7] bg-clip-text text-transparent">DevConnect</span>
            </Link>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 leading-relaxed">Find developers. Build teams. Ship products.</p>
          </div>
          <div>
            <h4 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-4">Platform</h4>
            <div className="space-y-3 text-sm">
              <Link to="/discover" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Discover</Link>
              <Link to="/projects" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Projects</Link>
              <Link to="/features" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Features</Link>
              <Link to="/pricing" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-4">Community</h4>
            <div className="space-y-3 text-sm">
              <Link to="/about" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">About</Link>
              <Link to="/blog" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Blog</Link>
              <a href="#" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Discord</a>
              <a href="#" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors" aria-label="GitHub">GitHub</a>
            </div>
          </div>
          <div>
            <h4 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-4">Support</h4>
            <div className="space-y-3 text-sm">
              <Link to="/contact" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Contact</Link>
              <a href="#" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Privacy</a>
              <a href="#" className="block text-gray-500 dark:text-gray-400 hover:text-[#6C4CF1] transition-colors">Terms</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} DevConnect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
