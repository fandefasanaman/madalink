import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, Trash2, Download, Activity, Database } from 'lucide-react';
import { getResetLogs } from '../services/databaseResetService';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'firebase'>('firebase');
  const [firebaseLogs, setFirebaseLogs] = useState<any[]>([]);
  const [resetLogs, setResetLogs] = useState<any[]>([]);

  const loadFirebaseLogs = () => {
    const storedLogs = JSON.parse(localStorage.getItem('firebase-logs') || '[]');
    setFirebaseLogs(storedLogs.reverse()); // Show newest first
  };

  const loadResetLogs = () => {
    const logs = getResetLogs();
    setResetLogs(logs);
  };

  const clearFirebaseLogs = () => {
    if (confirm('Effacer les logs Firebase ?')) {
      localStorage.removeItem('firebase-logs');
      setFirebaseLogs([]);
    }
  };

  const clearResetLogs = () => {
    if (confirm('Effacer les logs de reset ?')) {
      localStorage.removeItem('database-reset-logs');
      setResetLogs([]);
    }
  };

  const downloadFirebaseLogs = () => {
    const logsData = JSON.stringify(firebaseLogs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    if (isOpen) {
      loadFirebaseLogs();
      loadResetLogs();
    }
  }, [isOpen]);

  const getStatusColor = (success: boolean) => {
    return success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'ADD': return '➕';
      case 'UPDATE': return '🔄';
      case 'DELETE': return '🗑️';
      case 'MIGRATE': return '📦';
      default: return '🔥';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors touch-manipulation"
      >
        <Bug className="w-4 h-4" />
        <span>Debug</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Debug Logs</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadFirebaseLogs}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Télécharger les logs"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={clearFirebaseLogs}
                className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                title="Effacer les logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {firebaseLogs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Aucun log Firebase disponible
              </div>
            ) : (
              firebaseLogs.map((log, index) => (
                <div key={index} className="p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span>{getOperationIcon(log.operation)}</span>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {log.operation} - {log.collection}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(log.success)}`}>
                      {log.success ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </div>
                  {log.error && (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {log.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        
        {/* Reset Logs Tab */}
        {resetLogs.length > 0 && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">Logs de reset DB</h4>
              </div>
              <button
                onClick={clearResetLogs}
                className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                title="Effacer les logs de reset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {resetLogs.map((log, index) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-red-800 dark:text-red-300 text-sm">
                      Reset Database
                    </span>
                    <span className={`text-xs font-medium ${log.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {log.success ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                    <p>⏰ {new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                    <p>🗑️ {log.totalDeleted} documents supprimés</p>
                    <p>⚡ Durée: {log.duration}ms</p>
                    {log.error && (
                      <p className="text-red-700 dark:text-red-300 font-medium">❌ {log.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;