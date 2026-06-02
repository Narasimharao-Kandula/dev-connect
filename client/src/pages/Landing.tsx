import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import api from '../api/client';
import type { PlatformStats } from '../types';
import GoogleTranslate from '../components/GoogleTranslate';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1, delayChildren: 0.1 },
};

export default function Landing() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeroSection stats={stats} loading={loading} />
      <StatsSection stats={stats} loading={loading} />
      <FeaturedDevelopers />
      <FeaturedProjects />
      <CommunityShowcase />
      <CTASection />
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-gray-900 rounded-[14px] shadow-lg border border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center gap-2">
          <GoogleTranslate />
        </div>
      </div>
    </div>
  );
}

function HeroSection({ stats, loading }: { stats: PlatformStats | null; loading: boolean }) {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6C4CF1]/5 via-white to-[#9A7DF9]/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[#6C4CF1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {loading ? (
            <div className="inline-flex items-center gap-2 bg-[#6C4CF1]/10 border border-[#6C4CF1]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#6C4CF1] animate-pulse" />
              <span className="text-sm font-medium text-[#6C4CF1]">Loading...</span>
            </div>
          ) : stats ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#6C4CF1]/10 border border-[#6C4CF1]/20 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#6C4CF1] animate-pulse" />
              <span className="text-sm font-medium text-[#6C4CF1]">{stats.activeThisWeek.toLocaleString()}+ developers collaborating daily</span>
            </motion.div>
          ) : null}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-[1.1]"
          >
            Find Developers.{' '}
            <span className="text-gradient">Build Teams.</span>
            <br />
            Ship Products.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with skilled developers worldwide and turn your ideas into reality.
            Collaborate on projects, build teams, and grow your network.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white font-semibold px-8 py-3.5 rounded-[14px] text-base shadow-lg shadow-[#6C4CF1]/25 hover:shadow-xl hover:shadow-[#6C4CF1]/35 transition-all duration-200"
            >
              Get Started Free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold px-8 py-3.5 rounded-[14px] text-base border-2 border-gray-200 dark:border-gray-700 hover:border-[#6C4CF1]/30 hover:text-[#6C4CF1] hover:bg-[#6C4CF1]/5 transition-all duration-200"
            >
              Explore Projects
            </Link>
          </motion.div>
          {loading ? (
            <div className="mt-16 flex items-center justify-center gap-8 md:gap-12 text-sm text-gray-400 dark:text-gray-500">
              <div className="shimmer-bg h-4 w-36 rounded-lg" />
              <div className="shimmer-bg h-4 w-32 rounded-lg" />
              <div className="shimmer-bg h-4 w-28 rounded-lg" />
            </div>
          ) : stats ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 flex items-center justify-center gap-8 md:gap-12 text-sm text-gray-400 dark:text-gray-500"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{stats.totalUsers.toLocaleString()}+ developers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{stats.totalProjects.toLocaleString()}+ projects shipped</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{stats.totalCountries}+ countries</span>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ stats, loading }: { stats: PlatformStats | null; loading: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100/80 dark:border-gray-800/80 p-8 md:p-10" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="shimmer-bg w-12 h-12 rounded-[14px] mx-auto mb-3" />
                  <div className="shimmer-bg h-8 w-20 mx-auto mb-2 rounded-lg" />
                  <div className="shimmer-bg h-4 w-16 mx-auto rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!stats) return null;

  const items = [
    { label: 'Developers', value: stats.totalUsers, icon: '👥', suffix: '+' },
    { label: 'Countries', value: stats.totalCountries, icon: '🌍', suffix: '+' },
    { label: 'Projects', value: stats.totalProjects, icon: '📁', suffix: '+' },
    { label: 'Teams', value: stats.totalTeams, icon: '🤝', suffix: '+' },
  ];

  return (
    <section ref={ref} className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100/80 dark:border-gray-800/80 p-8 md:p-10" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-[14px] bg-[#6C4CF1]/10 flex items-center justify-center mx-auto mb-3 text-xl">
                  {item.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {isInView ? <AnimatedCounter target={item.value} /> : '0'}
                  <span className="text-[#6C4CF1]">{item.suffix}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}</>;
}

function FeaturedDevelopers() {
  const developers = [
    { name: 'Priya Patel', skill: 'AI/ML Engineer', country: 'India', color: '#6C4CF1' },
    { name: 'John Doe', skill: 'Backend Architect', country: 'USA', color: '#0EA5E9' },
    { name: 'Alex Chen', skill: 'Full-Stack Developer', country: 'Canada', color: '#10B981' },
    { name: 'Sarah Johnson', skill: 'DevOps Engineer', country: 'UK', color: '#F59E0B' },
  ];

  return (
    <section className="py-16 bg-[#f8f9fc] dark:bg-[#0f0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-3">Featured Developers</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-md mx-auto">Top-rated developers building amazing things on DevConnect</p>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" {...stagger}>
          {developers.map((dev, i) => (
            <motion.div
              key={dev.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-[20px] p-6 text-center border border-gray-100/80 dark:border-gray-800/80 card-hover"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
            >
              <div className="w-16 h-16 rounded-[16px] flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${dev.color}, ${dev.color}dd)` }}>
                {dev.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{dev.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dev.skill}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{dev.country}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs text-[#6C4CF1] font-medium">
                <span>View Profile</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedProjects() {
  const projects = [
    { name: 'AI Resume Builder', description: 'AI-powered resume builder with NLP', skills: ['Flutter', 'Node.js', 'AI/ML'] },
    { name: 'Food Delivery Platform', description: 'Full-stack food delivery marketplace', skills: ['React', 'Go', 'PostgreSQL'] },
    { name: 'Crypto Wallet', description: 'Secure multi-chain crypto wallet', skills: ['Rust', 'React', 'Web3'] },
    { name: 'Health Tracker', description: 'AI-driven personal health analytics', skills: ['Python', 'React Native', 'ML'] },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-3">Featured Projects</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-md mx-auto">Innovative projects looking for collaborators</p>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" {...stagger}>
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100/80 dark:border-gray-800/80 card-hover"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
            >
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#6C4CF1]/10 to-[#9A7DF9]/10 flex items-center justify-center mb-4 text-lg">
                📁
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.skills.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-[8px] bg-[#6C4CF1]/5 text-[#6C4CF1] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CommunityShowcase() {
  const items = [
    { icon: '🏆', title: 'Top Contributors', desc: 'Developers with the most successful project completions', color: '#F59E0B' },
    { icon: '🤝', title: 'Top Teams', desc: 'Highest-rated collaborative teams on the platform', color: '#6C4CF1' },
    { icon: '🚀', title: 'Hackathon Winners', desc: 'Teams that won hackathons after finding each other on DevConnect', color: '#10B981' },
  ];

  return (
    <section className="py-16 bg-[#f8f9fc] dark:bg-[#0f0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-3">Community Showcase</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-md mx-auto">Celebrating our amazing community achievements</p>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" {...stagger}>
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-[20px] p-8 text-center border border-gray-100/80 dark:border-gray-800/80 card-hover"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-5 text-2xl"
                style={{ background: `${item.color}12` }}
              >
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#6C4CF1] to-[#5538D6] rounded-[24px] p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Build Something Amazing?</h2>
            <p className="mt-4 text-[#DCD3FD] text-lg max-w-lg mx-auto">
              Join thousands of developers already collaborating on DevConnect.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 bg-white text-[#6C4CF1] font-semibold px-8 py-3.5 rounded-[14px] text-base shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
