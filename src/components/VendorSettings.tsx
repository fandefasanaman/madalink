import React, { useState } from 'react';
import { X, Building2, MapPin, Phone, Mail, FileText, Hash, Trash2, AlertTriangle, Wrench, CheckCircle } from 'lucide-react';
import DatabaseResetModal from './DatabaseResetModal';
import { useAuth } from '../contexts/AuthContext';
import { fixDuplicateReceipts, checkForDuplicates, resetNumberingSystem } from '../services/receiptNumberingService';

export interface VendorInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  nif?: string;
  stat?: string;
}

interface VendorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  vendorInfo: VendorInfo;
  onSave: (vendorInfo: VendorInfo) => void;
}

const VendorSettings: React.FC<VendorSettingsProps> = ({
  isOpen,
  onClose,
  vendorInfo,
  onSave
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<VendorInfo>(vendorInfo);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isFixingDuplicates, setIsFixingDuplicates] = useState(false);
  const [isResettingNumbering, setIsResettingNumbering] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof VendorInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetComplete = () => {
    setShowResetModal(false);
    // Optionnel: recharger la page pour un état complètement propre
    window.location.reload();
  };

  const handleCheckDuplicates = async () => {
    if (!currentUser) return;
    
    try {
      const result = await checkForDuplicates(currentUser.uid);
      setDuplicateCheckResult(result);
      console.log('🔍 Duplicate check result:', result);
    } catch (error) {
      console.error('❌ Error checking duplicates:', error);
      alert('Erreur lors de la vérification des doublons');
    }
  };

  const handleFixDuplicates = async () => {
    if (!currentUser) return;
    
    const confirmed = confirm(
      'Cette action va réassigner tous les numéros de reçu de manière séquentielle. ' +
      'Les anciens numéros seront perdus. Continuer ?'
    );
    
    if (!confirmed) return;
    
    setIsFixingDuplicates(true);
    
    try {
      const result = await fixDuplicateReceipts(currentUser.uid);
      
      if (result.success) {
        alert(`✅ Correction terminée ! ${result.fixed} commandes mises à jour.`);
        // Recharger la vérification
        await handleCheckDuplicates();
      } else {
        alert(`⚠️ Correction partielle. ${result.fixed} commandes mises à jour, ${result.errors.length} erreurs.`);
        console.error('Erreurs lors de la correction:', result.errors);
      }
    } catch (error) {
      console.error('❌ Error fixing duplicates:', error);
      alert('Erreur lors de la correction des doublons');
    } finally {
      setIsFixingDuplicates(false);
    }
  };

  const handleResetNumbering = async () => {
    if (!currentUser) return;
    
    const confirmed = confirm(
      'Cette action va complètement réinitialiser le système de numérotation des reçus. ' +
      'Tous les numéros seront réassignés séquentiellement (REC 001-2025, REC 002-2025, etc.). ' +
      'Cette action est irréversible. Continuer ?'
    );
    
    if (!confirmed) return;
    
    setIsResettingNumbering(true);
    
    try {
      const result = await resetNumberingSystem(currentUser.uid);
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        // Recharger la vérification
        await handleCheckDuplicates();
      } else {
        alert(`⚠️ ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error resetting numbering system:', error);
      alert('Erreur lors de la réinitialisation du système de numérotation');
    } finally {
      setIsResettingNumbering(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Paramètres de l'entreprise
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Building2 className="w-4 h-4 inline mr-2" />
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MapPin className="w-4 h-4 inline mr-2" />
              Adresse
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Phone className="w-4 h-4 inline mr-2" />
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Hash className="w-4 h-4 inline mr-2" />
              NIF - Facultatif
            </label>
            <input
              type="text"
              value={formData.nif || ''}
              onChange={(e) => handleChange('nif', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Numéro d'identification fiscale (optionnel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FileText className="w-4 h-4 inline mr-2" />
              STAT - Facultatif
            </label>
            <input
              type="text"
              value={formData.stat || ''}
              onChange={(e) => handleChange('stat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Numéro statistique (optionnel)"
            />
          </div>

          {/* Section dangereuse */}
          <div className="border-t border-red-200 dark:border-red-800 pt-6">
            {/* Outils de maintenance */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-2 mb-4">
                <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                    Outils de maintenance
                  </h4>
                  <p className="text-blue-700 dark:text-blue-400 text-sm">
                    Outils pour diagnostiquer et corriger les problèmes de numérotation des reçus.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleCheckDuplicates}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-105"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Vérifier les doublons</span>
                  </button>
                  
                  <button
                    onClick={handleResetNumbering}
                    disabled={isResettingNumbering}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isResettingNumbering
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                    } text-white`}
                  >
                    <Hash className={`w-4 h-4 ${isResettingNumbering ? 'animate-pulse' : ''}`} />
                    <span>{isResettingNumbering ? 'Réinitialisation...' : 'Réinitialiser complètement la numérotation'}</span>
                  </button>
                  {duplicateCheckResult?.hasDuplicates && (
                    <button
                      onClick={handleFixDuplicates}
                      disabled={isFixingDuplicates}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isFixingDuplicates
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 hover:scale-105'
                      } text-white`}
                    >
                      <Wrench className={`w-4 h-4 ${isFixingDuplicates ? 'animate-pulse' : ''}`} />
                      <span>{isFixingDuplicates ? 'Correction...' : 'Corriger les doublons'}</span>
                    </button>
                  )}
                </div>
                
                {duplicateCheckResult && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total commandes:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {duplicateCheckResult.totalOrders}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Doublons:</span>
                        <span className={`ml-2 font-medium ${
                          duplicateCheckResult.hasDuplicates 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {duplicateCheckResult.hasDuplicates ? duplicateCheckResult.duplicates.length : 'Aucun'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Séquence correcte:</span>
                        <span className={`ml-2 font-medium ${
                          duplicateCheckResult.hasNonSequential 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {duplicateCheckResult.hasNonSequential ? 'Non' : 'Oui'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Attendu:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          REC 001-2025, REC 002-2025...
                        </span>
                      </div>
                    </div>
                    
                    {duplicateCheckResult.hasDuplicates && (
                      <div className="space-y-1">
                        <p className="font-medium text-red-600 dark:text-red-400">Numéros dupliqués:</p>
                        {duplicateCheckResult.duplicates.map((dup: any) => (
                          <p key={dup.receiptNumber} className="text-red-700 dark:text-red-400 text-xs">
                            • {dup.receiptNumber} ({dup.count} fois)
                          </p>
                        ))}
                      </div>
                    )}
                    
                    {duplicateCheckResult.hasNonSequential && (
                      <div className="space-y-1 mt-2">
                        <p className="font-medium text-orange-600 dark:text-orange-400">Numérotation non-séquentielle détectée</p>
                        <p className="text-orange-700 dark:text-orange-400 text-xs">
                          Les numéros ne suivent pas la séquence REC 001, 002, 003...
                        </p>
                        {duplicateCheckResult.expectedSequence.length > 0 && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            Séquence attendue: {duplicateCheckResult.expectedSequence.slice(0, 5).join(', ')}...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">
                    Zone dangereuse
                  </h4>
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    Actions irréversibles qui suppriment définitivement vos données.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-105"
              >
                <Trash2 className="w-4 h-4" />
                <span>Vider complètement la base de données</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Enregistrer
            </button>
          </div>
        </form>
        
        <DatabaseResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onResetComplete={handleResetComplete}
        />
      </div>
    </div>
  );
};

export default VendorSettings;