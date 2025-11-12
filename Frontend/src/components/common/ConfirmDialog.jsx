import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger' // danger, warning, info
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-400',
          iconBg: 'bg-red-500/10',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: 'text-yellow-400',
          iconBg: 'bg-yellow-500/10',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          icon: 'text-blue-400',
          iconBg: 'bg-blue-500/10',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          icon: 'text-red-400',
          iconBg: 'bg-red-500/10',
          button: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-slate-800 border border-slate-700 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full mx-2 sm:mx-0">
          {/* Header */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${styles.icon}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-slate-700 rounded-lg flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{message}</p>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-900/50 border-t border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-4 sm:px-5 py-2 sm:py-2.5 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium text-sm sm:text-base"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 ${styles.button} text-white rounded-lg transition-colors font-medium shadow-lg text-sm sm:text-base`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

