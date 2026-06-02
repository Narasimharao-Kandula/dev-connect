import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/layout/Layout';
import PublicLayout from './components/layout/PublicLayout';
import { LoadingPage } from './components/ui/LottieLoader';
import { Toaster } from 'sonner';
import ErrorModal from './components/ui/ErrorModal';
import ErrorBoundary from './components/ErrorBoundary';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Discover = lazy(() => import('./pages/Discover'));
const DeveloperProfile = lazy(() => import('./pages/DeveloperProfile'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const ProjectList = lazy(() => import('./pages/ProjectList'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const TeamChat = lazy(() => import('./pages/TeamChat'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Chats = lazy(() => import('./pages/Chats'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));
const Landing = lazy(() => import('./pages/Landing'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const OnboardingWizard = lazy(() => import('./pages/OnboardingWizard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SearchResults = lazy(() => import('./pages/SearchResults'));

function ProtectedRoute({ children, onOnboarding }: { children: React.ReactNode; onOnboarding?: boolean }) {
  const { token, loading, user } = useAuthStore();
  if (loading) return <LoadingPage />;
  if (!token) return <Navigate to="/login" replace />;
  if (!onOnboarding && user && user.onboardingCompleted === false) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, loading, user } = useAuthStore();
  if (loading) return <LoadingPage />;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuthStore();
  if (loading) return <LoadingPage />;
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const SL = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<LoadingPage />}>{children}</Suspense>;

function AnimatedRoutes() {
  const location = useLocation();
  const tk = useAuthStore((s) => s.token);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SL><Landing /></SL>} />
            <Route path="/features" element={<SL><Features /></SL>} />
            <Route path="/pricing" element={<SL><Pricing /></SL>} />
            <Route path="/about" element={<SL><About /></SL>} />
            <Route path="/blog" element={<SL><Blog /></SL>} />
            <Route path="/contact" element={<SL><Contact /></SL>} />
          </Route>
          <Route path="/login" element={<PublicRoute><SL><AuthPage /></SL></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><SL><AuthPage /></SL></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><SL><ForgotPassword /></SL></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><SL><ResetPassword /></SL></PublicRoute>} />
          <Route path="/verify-email/:token" element={<SL><VerifyEmail /></SL>} />
          <Route path="/onboarding" element={<ProtectedRoute onOnboarding><SL><OnboardingWizard /></SL></ProtectedRoute>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<SL><Dashboard /></SL>} />
            <Route path="/discover" element={<SL><Discover /></SL>} />
            <Route path="/users/:id" element={<SL><DeveloperProfile /></SL>} />
            <Route path="/profile" element={<SL><Profile /></SL>} />
            <Route path="/settings" element={<SL><Settings /></SL>} />
            <Route path="/projects" element={<SL><ProjectList /></SL>} />
            <Route path="/projects/new" element={<SL><CreateProject /></SL>} />
            <Route path="/projects/:id" element={<SL><ProjectDetail /></SL>} />
            <Route path="/projects/:id/team" element={<SL><TeamChat /></SL>} />
            <Route path="/admin" element={<AdminRoute><SL><AdminDashboard /></SL></AdminRoute>} />
            <Route path="/notifications" element={<SL><Notifications /></SL>} />
            <Route path="/chats" element={<SL><Chats /></SL>} />
            <Route path="/chat/:id" element={<SL><ChatRoom /></SL>} />
            <Route path="/search" element={<SL><SearchResults /></SL>} />
          </Route>
          <Route path="*" element={<Navigate to={tk ? '/dashboard' : '/'} replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const { loadUser } = useAuthStore();
  useSocket();

  useEffect(() => { loadUser(); }, [loadUser]);

  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '14px', padding: '12px 16px', border: '1px solid #e8e8ef', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }, className: 'dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100' }} />
      <ErrorModal />
      <ErrorBoundary>
        <AnimatedRoutes />
      </ErrorBoundary>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
