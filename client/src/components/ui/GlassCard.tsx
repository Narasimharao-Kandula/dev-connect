import { memo } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const GlassCard = memo(function GlassCard({ children, className = '', hover = false, padding = 'md', onClick }: GlassCardProps) {
  const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-7' };
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 transition-all duration-300 ${paddings[padding]} ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
    >
      {children}
    </div>
  );
});

export default GlassCard;
