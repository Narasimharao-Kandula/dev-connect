import { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
};

const sizes = {
  sm: 'text-[10px] px-2 py-0.5 rounded-[8px]',
  md: 'text-xs px-2.5 py-1 rounded-[10px]',
};

const Badge = memo(function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
});

export default Badge;
