import { motion, AnimatePresence } from 'framer-motion';
import { useErrorModalStore } from '../../store/errorStore';

const errorIcons: Record<string, string> = {
  'no account': '🔍',
  'incorrect password': '🔑',
  'already exists': '👤',
  'already registered': '👤',
  'invalid email': '📧',
  'password must be': '🔒',
  'name must be': '✏️',
  'scheduled for deletion': '🗑️',
  'expired': '⏰',
  default: '⚠️',
};

function getIcon(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, icon] of Object.entries(errorIcons)) {
    if (lower.includes(key)) return icon;
  }
  return errorIcons.default;
}

function getTitle(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('no account')) return 'Account Not Found';
  if (lower.includes('incorrect password')) return 'Wrong Password';
  if (lower.includes('already exists') || lower.includes('already registered')) return 'Email Taken';
  if (lower.includes('invalid email')) return 'Invalid Email';
  if (lower.includes('password must be')) return 'Weak Password';
  if (lower.includes('name must be')) return 'Invalid Name';
  if (lower.includes('scheduled for deletion')) return 'Account Deleted';
  if (lower.includes('expired')) return 'Link Expired';
  return 'Error';
}

export default function ErrorModal() {
  const { open, title, message, closeModal } = useErrorModalStore();
  const icon = getIcon(message);
  const derivedTitle = title || getTitle(message);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm w-full rounded-[24px] overflow-hidden"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}
          >
            <div className="bg-white dark:bg-gray-900">
              <div className="px-6 pt-8 pb-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-red-50 dark:from-red-900/30 to-red-100 dark:to-red-900/20 flex items-center justify-center mx-auto mb-4 text-3xl"
                >
                  {icon}
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{derivedTitle}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-2">{message}</p>
              </div>
              <div className="px-6 pb-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={closeModal}
                  className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white font-semibold py-3.5 rounded-[14px] text-sm shadow-lg shadow-[#6C4CF1]/25 cursor-pointer transition-all hover:shadow-xl hover:shadow-[#6C4CF1]/30"
                >
                  Got it
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
