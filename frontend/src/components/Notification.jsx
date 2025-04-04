import { useEffect } from 'react';
import { CheckCircle2, XCircle, X, AlertCircle } from 'lucide-react';

// Base Notification Component to handle shared logic
const BaseNotification = ({ message, onClose, duration = 5000, children }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 w-full max-w-sm transform transition-all duration-300 ease-in-out animate-slide-in z-50">
      {children}
    </div>
  );
};

// Success Notification Component
export const SuccessNotification = ({ message, onClose, duration }) => {
  return (
    <BaseNotification message={message} onClose={onClose} duration={duration}>
      <div className="relative backdrop-blur-xl bg-white/90 rounded-2xl border border-green-100 shadow-lg shadow-green-500/10">
        <div className="flex items-start gap-3 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Success</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 h-5 w-5 flex items-center justify-center text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-b-2xl" />
      </div>
    </BaseNotification>
  );
};

// Error Notification Component
export const ErrorNotification = ({ message, onClose, duration }) => {
  return (
    <BaseNotification message={message} onClose={onClose} duration={duration}>
      <div className="relative backdrop-blur-xl bg-white/90 rounded-2xl border border-red-100 shadow-lg shadow-red-500/10">
        <div className="flex items-start gap-3 p-4">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 h-5 w-5 flex items-center justify-center text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-500 rounded-b-2xl" />
      </div>
    </BaseNotification>
  );
};

// Form Field Error Component
export const FormFieldError = ({ message }) => {
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};

// Notifications Container Component
export const NotificationsContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="z-50">
      {notifications.map((notification) => (
        notification.type === 'success' ? (
          <SuccessNotification
            key={notification.id}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ) : (
          <ErrorNotification
            key={notification.id}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        )
      ))}
      <NotificationStyles />
    </div>
  );
};

// Animations Style
const style = `
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%) translateY(0);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}
`;

export const NotificationStyles = () => (
  <style>{style}</style>
);