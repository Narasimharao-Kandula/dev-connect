import { memo } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const Button = memo(function Button({
  children, onClick, type = 'button', variant = 'primary', size = 'md',
  disabled, loading, className = '', fullWidth
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none';

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-[#5538D6] text-white hover:shadow-lg hover:shadow-primary/25 active:shadow-md active:shadow-primary/20',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 active:bg-gray-300 dark:active:bg-gray-600',
    ghost: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700',
    outline: 'border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 active:bg-primary/10',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/20',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 rounded-[10px] gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-[12px] gap-2',
    lg: 'text-base px-7 py-3.5 rounded-[14px] gap-2.5',
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
});

export default Button;
