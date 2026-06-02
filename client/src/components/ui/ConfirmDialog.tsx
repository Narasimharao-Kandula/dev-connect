interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 w-full max-w-md mx-4 animate-scale-in"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-lg font-semibold ${variant === 'danger' ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-4 py-2 text-sm font-medium rounded-[12px] hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-[12px] font-semibold text-sm transition disabled:opacity-50 cursor-pointer ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white shadow-lg shadow-[#6C4CF1]/20'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
