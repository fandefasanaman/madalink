import { useState, useEffect } from 'react';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(new Date());
      console.log('🌐 Connection restored at:', new Date().toISOString());
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🚫 Connection lost at:', new Date().toISOString());
    };

    // Écouter les événements de connexion
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les opérations Firebase pour détecter la connectivité
    const handleFirebaseOperation = (event: CustomEvent) => {
      if (event.detail.success) {
        setIsOnline(true);
        setLastOnlineTime(new Date());
      }
    };

    window.addEventListener('firebase-operation', handleFirebaseOperation as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('firebase-operation', handleFirebaseOperation as EventListener);
    };
  }, []);

  return {
    isOnline,
    lastOnlineTime
  };
};