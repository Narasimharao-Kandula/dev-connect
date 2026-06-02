import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import InstallPrompt from '../InstallPrompt';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0f0f1a]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-[#6C4CF1] focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6C4CF1]">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8 animate-fade-in">
        <Outlet />
      </main>
      <MobileBottomNav />
      <InstallPrompt />
    </div>
  );
}
