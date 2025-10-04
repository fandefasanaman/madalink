import { useState, useEffect } from 'react';

export interface EmailNotification {
  id: string;
  orderId: string;
  customerName: string;
  type: 'order_confirmed' | 'payment_received';
  timestamp: Date;
  status: 'sent' | 'failed';
}

export const useEmailNotifications = () => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleEmailSent = (event: CustomEvent) => {
      const { orderId, customerName, type, timestamp } = event.detail;
      
      const notification: EmailNotification = {
        id: Math.random().toString(36).substr(2, 9),
        orderId,
        customerName,
        type,
        timestamp,
        status: 'sent'
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Garder seulement 5 notifications
      setIsVisible(true);

      // Auto-hide après 5 secondes
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    window.addEventListener('email-sent', handleEmailSent as EventListener);
    
    return () => {
      window.removeEventListener('email-sent', handleEmailSent as EventListener);
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const dismissAll = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  return {
    notifications,
    isVisible,
    dismissNotification,
    dismissAll
  };
};