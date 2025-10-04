import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Shield, Clock, Database, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseResetService, ResetProgress, ResetResult } from '../services/databaseResetService';

interface DatabaseResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete?: () => void;
}

const DatabaseResetModal: React.FC<DatabaseResetModalProps> = ({ 
  isOpen, 
  onClose, 
  onResetComplete 
}) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'warning' | 'confirmation' | 'progress' | 'completed'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState<ResetProgress[]>([]);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [estimation, setEstimation] = useState<any>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadEstimation();
    }
  }, [isOpen, currentUser]);

  const loadEstimation = async () => {
    if (!currentUser) return;
    
    try {
      const est = await DatabaseResetService.estimateResetTime(currentUser.uid);
      setEstimation(est);
      console.log('📊 Reset estimation loaded:', est);
    } catch (error) {
      console.error('❌ Error loading estimation:', error);
    }
  };

  const handleReset = async () => {
    if (!currentUser || confirmationText !== 'SUPPRIMER TOUTES MES DONNÉES') {
      return;
    }

    setStep('progress');
    setIsResetting(true);
    setResetProgress([]);

    try {
      const result = await DatabaseResetService.resetUserData(
        currentUser.uid,
        (progress) => {
          setResetProgress(prev => {
            const existing = prev.find(p => p.collection === progress.collection);
            if (existing) {
              return prev.map(p => p.collection === progress.collection ? progress : p);
            } else {
              return [...prev, progress];
            }
          });
        }
      );

      setResetResult(result);
      setStep('completed');
      
      if (result.success) {
        console.log('🎉 Database reset completed successfully');
        
        // Nettoyer le localStorage aussi
        localStorage.removeItem('firebase-logs');
        localStorage.removeItem('email-logs');
        localStorage.removeItem('email-history');
        localStorage.removeItem('receipt-counter');
        
        // Notifier le parent après un délai
        setTimeout(() => {
          onResetComplete?.();
        }, 2000);
      }

    } catch (error) {
      console.error('💥 Database reset failed:', error);
      setResetResult({
        success: false,
        totalDeleted: 0,
        collections: [],
        duration: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      setStep('completed');
    } finally {
      setIsResetting(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const resetSteps = () => {
    setStep('warning');
    setConfirmationText('');
    setResetProgress([]);
    setResetResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reset de la base de données
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Suppression complète des données</p>
            </div>
          </div>
          {step !== 'progress' && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Étape 1: Avertissement */}
          {step === 'warning' && (
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-800 dark:text-red-300 text-lg mb-2">
                      ⚠️ ATTENTION - OPÉRATION IRRÉVERSIBLE
                    </h3>
                    <p className="text-red-700 dark:text-red-400 mb-3">
                      Cette action va <strong>supprimer définitivement</strong> toutes vos données :
                    </p>
                    <ul className="text-red-700 dark:text-red-400 text-sm space-y-1 list-disc list-inside">
                      <li>Tous vos clients et leurs informations</li>
                      <li>Toutes vos commandes et historiques</li>
                      <li>Tous vos produits et stocks</li>
                      <li>Toutes vos notes et interactions</li>
                      <li>Tous vos rappels et tâches</li>
                      <li>Vos paramètres d'entreprise</li>
                    </ul>
                    <p className="text-red-800 dark:text-red-300 font-bold mt-3">
                      Cette action ne peut PAS être annulée !
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimation */}
              {estimation && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Estimation de suppression</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Documents à supprimer</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{estimation.totalDocuments}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Temps estimé</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDuration(estimation.estimatedDuration)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    {estimation.collections.map((col: any) => (
                      <div key={col.name} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{col.name}:</span>
                        <span className="text-gray-900 dark:text-white">{col.count} documents</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setStep('confirmation')}
                  className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                >
                  <Shield className="w-4 h-4" />
                  <span>Je comprends, continuer</span>
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-bold text-red-800 dark:text-red-300">
                    Confirmation de sécurité
                  </h3>
                </div>
                <p className="text-red-700 dark:text-red-400 mb-4">
                  Pour confirmer cette action destructive, tapez exactement le texte suivant :
                </p>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-center text-sm mb-4">
                  SUPPRIMER TOUTES MES DONNÉES
                </div>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Tapez le texte de confirmation..."
                  className="w-full bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setStep('warning')}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleReset}
                  disabled={confirmationText !== 'SUPPRIMER TOUTES MES DONNÉES'}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    confirmationText !== 'SUPPRIMER TOUTES MES DONNÉES'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>SUPPRIMER DÉFINITIVEMENT</span>
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Progression */}
          {step === 'progress' && (
            <div className="space-y-6">
              <div className="text-center">
                <Loader className="w-12 h-12 text-red-600 dark:text-red-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Suppression en cours...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Veuillez patienter pendant la suppression de vos données
                </p>
              </div>

              {/* Progression par collection */}
              <div className="space-y-3">
                {resetProgress.map((progress) => (
                  <div key={progress.collection} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {progress.collection}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {progress.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Loader className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {progress.deleted}/{progress.total}
                        </span>
                      </div>
                    </div>
                    
                    {progress.total > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.completed 
                              ? 'bg-emerald-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${(progress.deleted / progress.total) * 100}%`
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Étape 4: Résultat */}
          {step === 'completed' && resetResult && (
            <div className="space-y-6">
              <div className="text-center">
                {resetResult.success ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Reset terminé avec succès
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Toutes vos données ont été supprimées de la base de données
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Erreur lors du reset
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Une erreur s'est produite pendant la suppression
                    </p>
                    {resetResult.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-red-700 dark:text-red-400 text-sm font-mono">
                          {resetResult.error}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Statistiques */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Statistiques</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Documents supprimés</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{resetResult.totalDeleted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Durée</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDuration(resetResult.duration)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  {resetResult.collections.map((col) => (
                    <div key={col.collection} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{col.collection}:</span>
                      <span className={col.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {col.deleted}/{col.total} {col.completed ? '✅' : '❌'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                {!resetResult.success && (
                  <button
                    onClick={resetSteps}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Réessayer
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseResetModal;