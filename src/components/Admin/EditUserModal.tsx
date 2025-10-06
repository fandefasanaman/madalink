import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { UserProfile } from '../../services/firebaseAuth';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (userId: string, updates: Partial<UserProfile>, newPassword?: string) => Promise<void>;
  user: UserProfile | null;
}

const PLANS = [
  { value: 'trial', label: 'Essai 15 jours', price: '3 500 MGA' },
  { value: 'bronze', label: 'Bronze', price: '7 000 MGA/mois' },
  { value: 'silver', label: 'Silver', price: '10 000 MGA/mois', popular: true }
];

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onEditUser, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    plan: 'trial' as UserProfile['plan'],
    status: 'active' as 'active' | 'pending' | 'suspended',
    isAdmin: false
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        plan: user.plan,
        status: user.status || 'active',
        isAdmin: user.isAdmin
      });
      setNewPassword('');
      setConfirmPassword('');
      setChangePassword(false);
    }
  }, [user]);

  const generatePassword = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const password = generatePassword();
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');

    if (!formData.name) {
      setError('Le nom est requis');
      return;
    }

    if (changePassword) {
      if (!newPassword) {
        setError('Le nouveau mot de passe est requis');
        return;
      }

      if (newPassword.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
    }

    setLoading(true);
    try {
      await onEditUser(user.id, formData, changePassword ? newPassword : undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setNewPassword('');
      setConfirmPassword('');
      setChangePassword(false);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Modifier l'utilisateur
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email (non modifiable)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ex: Rakoto Andry"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan d'abonnement *
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as UserProfile['plan'] })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
              disabled={loading}
            >
              {PLANS.map((plan) => (
                <option key={plan.value} value={plan.value}>
                  {plan.label} - {plan.price} {plan.popular ? '(Populaire)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
              disabled={loading}
            >
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              disabled={loading}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Administrateur
            </label>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="changePassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Changer le mot de passe
              </label>
            </div>

            {changePassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                      placeholder="Minimum 8 caractères"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                      placeholder="Confirmer le mot de passe"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Générer un mot de passe sécurisé</span>
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Le nouveau mot de passe sera appliqué immédiatement. L'utilisateur devra l'utiliser pour sa prochaine connexion.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>Statistiques:</strong> {user.totalDownloads || 0} téléchargements
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              <strong>Inscription:</strong> {user.createdAt.toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Modification...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
