import React, { useState, useEffect } from 'react';
import { X, Mail, Clock, CheckCircle, XCircle, Download, Trash2, Activity, AlertTriangle, Info } from 'lucide-react';
import { emailService } from '../services/emailService';

interface EmailHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailHistoryModal: React.FC<EmailHistoryModalProps> = ({ isOpen, onClose }) => {
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'simple' | 'detailed'>('detailed');
  const [emailStats, setEmailStats] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadEmailLogs();
      loadEmailStats();
    }
  }, [isOpen]);

  const loadEmailLogs = () => {
    const logs = emailService.loadLogs();
    setEmailLogs(logs);
    console.log('📧 Loaded email logs:', logs.length);
  };

  const loadEmailStats = () => {
    const stats = emailService.getEmailStats();
    setEmailStats(stats);
    console.log('📊 Email stats:', stats);
  };

  const clearLogs = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les logs d\'emails ?')) {
      emailService.clearLogs();
      localStorage.removeItem('email-history'); // Nettoyer aussi l'ancien format
      setEmailLogs([]);
      setEmailStats(emailService.getEmailStats());
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(emailLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'sending': return <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />;
      default: return <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'sending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'order_confirmed': return 'Commande confirmée';
      case 'payment_received': return 'Paiement reçu';
      default: return type || 'Email';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Logs et historique des emails
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {emailLogs.length} opération{emailLogs.length !== 1 ? 's' : ''} d'email
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportLogs}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Exporter les logs"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={clearLogs}
              className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Effacer les logs"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Statistiques */}
          {emailStats && emailStats.total > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Statistiques globales</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{emailStats.total}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Envoyés</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{emailStats.sent}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Échecs</p>
                  <p className="font-semibold text-red-600 dark:text-red-400">{emailStats.failed}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Taux de succès</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {emailStats.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Onglets */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('detailed')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'detailed'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Logs détaillés ({emailLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('simple')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'simple'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Historique simple
            </button>
          </div>

          {emailLogs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun log d'email
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les logs des tentatives d'envoi d'emails apparaîtront ici
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'detailed' ? (
                <div className="space-y-3">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(log.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {log.subject}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(log.status)}`}>
                              {log.status === 'sent' ? 'Envoyé' : 
                               log.status === 'failed' ? 'Échec' : 
                               log.status === 'sending' ? 'Envoi...' : log.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <p>📮 À: {log.to}</p>
                            <p>⏰ {formatDate(log.timestamp)}</p>
                            {log.orderId && <p>🛒 Commande: #{log.orderId}</p>}
                            {log.type && <p>🏷️ Type: {getTypeLabel(log.type)}</p>}
                            {log.details?.duration && <p>⚡ Durée: {log.details.duration}ms</p>}
                          </div>
                          
                          {log.error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mt-2">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                                    Erreur: {log.error}
                                  </p>
                                  {log.details && (
                                    <details className="mt-1">
                                      <summary className="text-xs text-red-600 dark:text-red-500 cursor-pointer">
                                        Détails techniques
                                      </summary>
                                      <pre className="text-xs text-red-600 dark:text-red-500 mt-1 overflow-x-auto">
                                        {JSON.stringify(log.details, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {log.status === 'sent' && log.details && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              ✅ Envoyé via {log.details.smtpServer} en {log.details.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const simpleHistory = JSON.parse(localStorage.getItem('email-history') || '[]');
                    return simpleHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">
                          Aucun email dans l'historique simple
                        </p>
                      </div>
                    ) : (
                      simpleHistory.reverse().map((email: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            email.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {email.status === 'sent' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {email.subject}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              Envoyé à: {email.to}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {formatDate(email.sentAt)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                email.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                              }`}>
                                {email.status === 'sent' ? 'Envoyé' : 'Échec'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailHistoryModal;