import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_KEY = 'devconnect_tour_completed';

interface Step {
  title: string;
  description: string;
  action?: { label: string; path: string };
  icon: string;
}

const steps: Step[] = [
  { icon: '👋', title: 'Welcome to DevConnect!', description: 'Let us show you around so you can make the most of the platform.', action: { label: 'Let\'s Go!', path: '' } },
  { icon: '🔍', title: 'Discover Developers', description: 'Find developers by skills, location, and availability. Save your favorite searches for quick access.', action: { label: 'Explore Discover', path: '/discover' } },
  { icon: '💬', title: 'Start Collaborating', description: 'Send collaboration requests, chat in real-time, and work together on projects.', action: { label: 'View Chats', path: '/chats' } },
  { icon: '📋', title: 'Manage Projects', description: 'Create projects, build your team, and track progress with the Kanban board.', action: { label: 'My Projects', path: '/projects' } },
  { icon: '🔔', title: 'Stay Updated', description: 'Get notified about collaboration requests, project matches, and team invites in real-time.', action: { label: 'Notifications', path: '/notifications' } },
  { icon: '⚙️', title: 'Customize Everything', description: 'Adjust your profile, change themes, set notification preferences, and more in Settings.', action: { label: 'Open Settings', path: '/settings' } },
];

export function useOnboarding() {
  const [tourCompleted, setTourCompleted] = useState(() => localStorage.getItem(TOUR_KEY) === 'true');

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, 'true');
    setTourCompleted(true);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_KEY);
    setTourCompleted(false);
  }, []);

  return { tourCompleted, completeTour, resetTour };
}

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    if (steps[currentStep].action?.path) {
      navigate(steps[currentStep].action!.path);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }, [currentStep, navigate, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 dark:bg-black/50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100/80 dark:border-gray-800/80 p-6 max-w-sm w-full shadow-2xl"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#6C4CF1]/10 dark:bg-[#6C4CF1]/20 flex items-center justify-center mx-auto mb-4 text-2xl">
              {step.icon}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{step.description}</p>
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {steps.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-[#6C4CF1] w-4' : 'bg-gray-300 dark:bg-gray-700'}`} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSkip} className="flex-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-2.5 rounded-[12px] hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer">
                Skip
              </button>
              <button onClick={handleNext} className="flex-1 bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white py-2.5 rounded-[12px] text-sm font-semibold shadow-lg shadow-[#6C4CF1]/20 hover:shadow-xl transition cursor-pointer">
                {currentStep < steps.length - 1 ? (step.action?.label || 'Next') : 'Get Started!'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
