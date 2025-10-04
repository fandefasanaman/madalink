import React, { useState } from 'react';
import { X, Database, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { migrationService } from '../services/firebaseService';
import { Contact, Product, Order, Note, Reminder } from '../utils/types';
import { VendorInfo } from './VendorSettings';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  localData: {
    contacts: Contact[];
    products: Product[];
    orders: Order[];
    notes: Note[];
    reminders: Reminder[];
    vendorInfo: VendorInfo;
  };
  onMigrationComplete: () => void;
}

const MigrationModal: React.FC<MigrationModalProps> = ({ 
  isOpen, 
  onClose, 
  localData, 
  onMigrationComplete 
}) => {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const handleMigration = async () => {
    if (!currentUser) {
      setError('Utilisateur non authentifié');
      setMigrationStatus('error');
      return;
    }
    
    try {
      setMigrationStatus('migrating');
      setError(null);
      
      await migrationService.migrateAllData(localData, currentUser.uid);
      
      setMigrationStatus('success');
      
      // Auto-close after 2 seconds and trigger completion callback
      setTimeout(() => {
        onMigrationComplete();
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Migration error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue lors de la migration');
      setMigrationStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Migration vers Firebase
            </h2>
          </div>
          {migrationStatus === 'idle' && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        <div className="p-6">
          {migrationStatus === 'idle' && (
            <>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Cette opération va migrer toutes vos données locales vers Firebase. 
                  Voici un résumé de ce qui sera migré :
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Clients :</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {localData.contacts.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Produits :</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {localData.products.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Commandes :</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {localData.orders.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Notes :</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {localData.notes.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rappels :</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {localData.reminders.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Informations vendeur :</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {localData.vendorInfo ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                      Important
                    </h4>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                      Cette opération est irréversible. Assurez-vous d'avoir une sauvegarde 
                      de vos données si nécessaire. Après la migration, l'application utilisera 
                      exclusivement Firebase pour le stockage des données.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleMigration}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
                >
                  <Upload className="w-4 h-4" />
                  <span>Commencer la migration</span>
                </button>
              </div>
            </>
          )}

          {migrationStatus === 'migrating' && (
            <div className="text-center py-8">
              <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Migration en cours...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Veuillez patienter pendant que nous transférons vos données vers Firebase.
              </p>
            </div>
          )}

          {migrationStatus === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Migration réussie !
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Toutes vos données ont été transférées avec succès vers Firebase.
                L'application va maintenant utiliser le cloud pour le stockage.
              </p>
            </div>
          )}

          {migrationStatus === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Erreur de migration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Une erreur s'est produite lors de la migration :
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-red-700 dark:text-red-400 text-sm font-mono">
                  {error}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setMigrationStatus('idle');
                    setError(null);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationModal;