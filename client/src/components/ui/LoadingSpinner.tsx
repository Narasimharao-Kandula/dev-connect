import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-14 h-14' };
  return (
    <div className="flex justify-center items-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="relative"
      >
        <div className={`${sizeClasses[size]} rounded-full border-2 border-[#6C4CF1]/10`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-[#6C4CF1]`} />
        <motion.div
          className={`absolute inset-1 ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-[#6C4CF1]/5 to-transparent`}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}
