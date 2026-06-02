import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 flex items-center justify-center rounded-[var(--radius-button)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#6C4CF1] dark:hover:text-[#9A7DF9] hover:border-[#6C4CF1]/30 dark:hover:border-[#6C4CF1]/50 transition-all duration-200 shadow-sm"
    >
      <FiSun className={`absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} size={16} />
      <FiMoon className={`absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} size={15} />
    </button>
  );
}
