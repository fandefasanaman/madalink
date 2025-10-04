import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';

interface RealTimeIndicatorProps {
  isConnected: boolean;
  lastUpdate: Date;
  className?: string;
}

const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ 
  isConnected, 
  lastUpdate, 
  className = "" 
}) => {
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 10) return 'À l\'instant';
    if (seconds < 60) return `Il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `Il y a ${hours}h`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
        isConnected 
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Temps réel</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Hors ligne</span>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{formatLastUpdate(lastUpdate)}</span>
      </div>
    </div>
  );
};

export default RealTimeIndicator;