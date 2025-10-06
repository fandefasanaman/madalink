import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface OrphanUsersPanelProps {
  onRefresh: () => void;
}

const OrphanUsersPanel: React.FC<OrphanUsersPanelProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
            Problème détecté
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
            Si vous voyez le message "Cet email est déjà utilisé" mais l'utilisateur n'apparaît pas dans la liste,
            cela signifie qu'un compte existe dans Firebase Auth mais son profil est manquant dans Firestore.
          </p>
          <div className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
            <strong>Solutions possibles :</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Vérifiez la console Firebase Auth pour voir tous les comptes créés</li>
              <li>Supprimez le compte orphelin directement depuis la console Firebase Auth</li>
              <li>Recréez le profil manuellement dans Firestore si nécessaire</li>
            </ul>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Actualisation...' : 'Actualiser la liste'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrphanUsersPanel;
