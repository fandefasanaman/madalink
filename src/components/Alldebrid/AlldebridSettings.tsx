import React, { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, AlertCircle, CheckCircle, Settings, Info, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlldebridContext } from '../../contexts/AlldebridContext';

interface AlldebridSettingsProps {
  onApiKeyChange: (apiKey: string) => void;
}

const AlldebridSettings: React.FC<AlldebridSettingsProps> = ({ onApiKeyChange }) => {
  const { user } = useAuth();
  const { adminApiKey, updateAdminApiKey, loading: contextLoading } = useAlldebridContext();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (adminApiKey) {
      setApiKey(adminApiKey);
      onApiKeyChange(adminApiKey);
    }
  }, [adminApiKey, onApiKeyChange]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setSaveStatus('error');
      return;
    }

    if (!user?.isAdmin) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateAdminApiKey(apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setSaveStatus('success');

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!user?.isAdmin) return;

    setApiKey('');
    try {
      await updateAdminApiKey('');
      onApiKeyChange('');
      setSaveStatus('idle');
    } catch (error) {
      console.error('Error clearing API key:', error);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg mr-4">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Accès restreint
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seuls les administrateurs peuvent accéder à cette section
            </p>
          </div>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            La configuration de la clé API est gérée par les administrateurs.
            Si vous rencontrez des problèmes, contactez votre administrateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg mr-4">
          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Configuration Alldebrid (Admin)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configurez la clé API Alldebrid globale pour tous les utilisateurs
          </p>
        </div>
      </div>

      {/* Information sur Alldebrid */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Qu'est-ce qu'Alldebrid ?
            </p>
            <p className="text-blue-800 dark:text-blue-200 mb-2">
              Alldebrid est un service premium qui vous permet de télécharger des fichiers depuis plus de 80 hébergeurs 
              (1fichier, Mega, RapidGator, etc.) à vitesse maximale et sans limitation.
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Comment obtenir votre clé API :</strong>
            </p>
            <ol className="list-decimal list-inside text-blue-800 dark:text-blue-200 mt-1 space-y-1">
              <li>Créez un compte sur <a href="https://alldebrid.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">alldebrid.com</a></li>
              <li>Souscrivez à un abonnement premium</li>
              <li>Allez dans "Mon compte" → "API"</li>
              <li>Générez votre clé API et copiez-la ici</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Formulaire de configuration */}
      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Clé API Alldebrid
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Votre clé API Alldebrid"
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Messages de statut */}
        {saveStatus === 'success' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700 dark:text-green-400 text-sm">
              Clé API sauvegardée avec succès !
            </span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400 text-sm">
              Erreur lors de la sauvegarde. Vérifiez votre clé API.
            </span>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || isSaving}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Sauvegarder
              </>
            )}
          </button>
          
          <button
            onClick={handleClear}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Effacer
          </button>
        </div>
      </div>

      {/* Sécurité */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          <Key className="h-4 w-4 mr-2" />
          Sécurité et utilisation
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Cette clé API est utilisée automatiquement par tous les clients</li>
          <li>• Les clients ne peuvent pas voir ou modifier la clé API</li>
          <li>• La clé est stockée de manière sécurisée dans la base de données</li>
          <li>• Seuls les administrateurs peuvent la configurer</li>
          <li>• Vous pouvez la modifier ou la supprimer à tout moment</li>
        </ul>
      </div>
    </div>
  );
};

export default AlldebridSettings;