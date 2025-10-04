import React from 'react';
import { Mail, CheckCircle, X, XCircle } from 'lucide-react';
import { useEmailNotifications } from '../hooks/useEmailNotifications';

const EmailNotifications: React.FC = () => {
  const { notifications, isVisible, dismissNotification, dismissAll } = useEmailNotifications();

  if (!isVisible || notifications.length === 0) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order_confirmed': return 'Commande confirmée';
      case 'payment_received': return 'Paiement reçu';
      default: return type;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-4 transform transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              notification.status === 'sent' 
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {notification.status === 'sent' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Reçu envoyé
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {notification.customerName}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                  {getTypeLabel(notification.type)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {formatTime(notification.timestamp)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => dismissNotification(notification.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {notifications.length > 1 && (
        <button
          onClick={dismissAll}
          className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2 transition-colors"
        >
          Masquer toutes les notifications
        </button>
      )}
    </div>
  );
};

export default EmailNotifications;