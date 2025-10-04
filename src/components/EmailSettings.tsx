import React, { useState, useEffect } from 'react';
import { X, Mail, Server, Key, Save, TestTube, CheckCircle, AlertCircle, Activity, BarChart3, ExternalLink, Info } from 'lucide-react';
import { EmailConfig, emailService } from '../services/emailService';

interface EmailSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EmailConfig) => void;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<EmailConfig>({
    serviceId: 'service_las5s4s',
    templateId: 'template_53t3n1h',
    publicKey: 'FLgkivMEFgFG1TOXa',
    fromEmail: 'noreply@kefir-madagascar.mg',
    fromName: 'Kéfir Madagascar'
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testDetails, setTestDetails] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [emailStats, setEmailStats] = useState<any>(null);

  useEffect(() => {
    // Charger la configuration sauvegardée
    const savedConfig = localStorage.getItem('email-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration email:', error);
      }
    }
    
    // Charger les statistiques d'email
    if (isOpen) {
      const stats = emailService.getEmailStats();
      setEmailStats(stats);
      console.log('📊 Email stats loaded:', stats);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof EmailConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null); // Reset test result when config changes
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    setTestDetails(null);

    console.log('🧪 Starting EmailJS connection test...');
    
    try {
      // Mettre à jour la configuration du service avant le test
      emailService.updateConfig(config);
      
      const result = await emailService.testConnection();
      
      setTestResult(result.success ? 'success' : 'error');
      setTestDetails(result);
      
      console.log('🧪 EmailJS test completed:', result);
    } catch (error) {
      console.error('🧪 EmailJS test exception:', error);
      setTestResult('error');
      setTestDetails({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: { exception: true }
      });
    }
    
    setIsTestingConnection(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('email-config', JSON.stringify(config));
      
      // Mettre à jour la configuration du service
      emailService.updateConfig(config);
      
      // Appeler le callback parent
      onSave(config);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configuration Email (EmailJS)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Guide de configuration EmailJS */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Configuration EmailJS
                </h4>
                <div className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                  <p>1. Créez un compte sur <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">EmailJS.com</a></p>
                  <p>2. Créez un service email (Gmail, Outlook, etc.)</p>
                  <p>3. Créez un template d'email avec les variables nécessaires</p>
                  <p>4. Copiez les IDs ci-dessous depuis votre dashboard EmailJS</p>
                </div>
                <a 
                  href="https://dashboard.emailjs.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir le dashboard EmailJS</span>
                </a>
              </div>
            </div>
          </div>

          {/* Configuration EmailJS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Server className="w-4 h-4 inline mr-1" />
                Service ID *
              </label>
              <input
                type="text"
                value={config.serviceId}
                onChange={(e) => handleInputChange('serviceId', e.target.value)}
                placeholder="service_xxxxxxx"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Trouvé dans EmailJS Dashboard → Email Services
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Template ID *
              </label>
              <input
                type="text"
                value={config.templateId}
                onChange={(e) => handleInputChange('templateId', e.target.value)}
                placeholder="template_xxxxxxx"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Trouvé dans EmailJS Dashboard → Email Templates
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Key className="w-4 h-4 inline mr-1" />
              Clé publique *
            </label>
            <input
              type="text"
              value={config.publicKey}
              onChange={(e) => handleInputChange('publicKey', e.target.value)}
              placeholder="xxxxxxxxxxxxxxx"
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Trouvée dans EmailJS Dashboard → Account → General
            </p>
          </div>

          {/* Informations d'expéditeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email expéditeur *
              </label>
              <input
                type="email"
                value={config.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                placeholder="noreply@kefir-madagascar.mg"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom expéditeur *
              </label>
              <input
                type="text"
                value={config.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                placeholder="Kéfir Madagascar"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Template EmailJS requis */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
              Variables requises dans votre template EmailJS
            </h4>
            <div className="text-amber-700 dark:text-amber-400 text-sm">
              <p className="mb-2">Votre template EmailJS doit contenir ces variables :</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs">
                <span>{{to_email}}</span>
                <span>{{from_name}}</span>
                <span>{{subject}}</span>
                <span>{{order_id}}</span>
                <span>{{customer_name}}</span>
                <span>{{total_amount}}</span>
                <span>{{html_content}}</span>
                <span>{{text_content}}</span>
                <span>{{order_date}}</span>
              </div>
            </div>
          </div>

          {/* Test de connexion */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Test de connexion EmailJS</h3>
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection || !config.serviceId || !config.templateId || !config.publicKey}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isTestingConnection || !config.serviceId || !config.templateId || !config.publicKey
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                }`}
              >
                <TestTube className={`w-4 h-4 ${isTestingConnection ? 'animate-pulse' : ''}`} />
                <span>{isTestingConnection ? 'Test en cours...' : 'Tester EmailJS'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg ${
                testResult === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {testResult === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {testResult === 'success' 
                      ? 'Test EmailJS réussi ! Email de test envoyé.'
                      : 'Échec du test EmailJS.'
                    }
                  </span>
                </div>
                
                {testDetails && (
                  <div className="text-xs space-y-1">
                    {testResult === 'success' ? (
                      <div>
                        <p>✅ Service ID: {testDetails.details?.serviceId}</p>
                        <p>✅ Template ID: {testDetails.details?.templateId}</p>
                        <p>✅ Status: {testDetails.details?.status}</p>
                        <p>✅ Response: {testDetails.details?.text}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">❌ Erreur: {testDetails.error}</p>
                        {testDetails.details?.errors && (
                          <div className="mt-1">
                            {testDetails.details.errors.map((err: string, i: number) => (
                              <p key={i}>• {err}</p>
                            ))}
                          </div>
                        )}
                        {testDetails.details?.serviceId && (
                          <p className="mt-1">Service ID utilisé: {testDetails.details.serviceId}</p>
                        )}
                        {testDetails.details?.templateId && (
                          <p>Template ID utilisé: {testDetails.details.templateId}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistiques d'envoi */}
          {emailStats && emailStats.total > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Statistiques d'envoi</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total envoyés</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{emailStats.total}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Réussis</p>
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
              {emailStats.lastSent && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Dernier envoi: {new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(emailStats.lastSent)}
                </p>
              )}
            </div>
          )}

          {/* Guide détaillé */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
              Guide de configuration étape par étape
            </h4>
            <div className="text-green-700 dark:text-green-400 text-sm space-y-2">
              <div>
                <p className="font-medium">Étape 1: Créer un service EmailJS</p>
                <p>• Allez sur dashboard.emailjs.com → Email Services</p>
                <p>• Cliquez "Add New Service" et choisissez Gmail/Outlook</p>
                <p>• Copiez le Service ID généré</p>
              </div>
              <div>
                <p className="font-medium">Étape 2: Créer un template</p>
                <p>• Allez sur Email Templates → Create New Template</p>
                <p>• Utilisez les variables comme {{to_email}}, {{subject}}, {{html_content}}</p>
                <p>• Copiez le Template ID généré</p>
              </div>
              <div>
                <p className="font-medium">Étape 3: Obtenir la clé publique</p>
                <p>• Allez sur Account → General</p>
                <p>• Copiez votre Public Key</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!config.serviceId || !config.templateId || !config.publicKey || !config.fromEmail || isSaving}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
              !config.serviceId || !config.templateId || !config.publicKey || !config.fromEmail || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;