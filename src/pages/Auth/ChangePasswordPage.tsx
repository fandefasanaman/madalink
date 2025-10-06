import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FirebaseAuthService } from '../../services/firebaseAuth';
import Logo from '../../components/Logo';

const ChangePasswordPage: React.FC = () => {
  const { user, firebaseUser, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordStrength < 2) {
      setError('Le mot de passe n\'est pas assez fort. Utilisez au moins 8 caractères avec des lettres et des chiffres.');
      return;
    }

    if (!firebaseUser || !user) {
      setError('Session invalide');
      return;
    }

    setLoading(true);
    try {
      console.log('Début du changement de mot de passe');
      await FirebaseAuthService.changePassword(currentPassword, newPassword);
      console.log('Changement de mot de passe réussi');

      console.log('Mise à jour du profil Firestore');
      await FirebaseAuthService.updateUserProfile(user.id, {
        passwordMustChange: false,
        passwordResetRequired: false
      });

      console.log('Récupération du profil mis à jour');
      const updatedProfile = await FirebaseAuthService.getUserProfile(user.id);
      await updateProfile(updatedProfile);

      console.log('Profil mis à jour dans le contexte, redirection vers dashboard');
      console.log('IMPORTANT: Vous restez connecté, ne vous déconnectez pas manuellement');

      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Mot de passe actuel incorrect');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe n\'est pas assez fort');
      } else {
        setError(err.message || 'Erreur lors du changement de mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: number): string => {
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength <= 1) return 'Faible';
    if (strength === 2) return 'Moyen';
    if (strength === 3) return 'Bon';
    return 'Fort';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Changement de mot de passe obligatoire
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire avant de continuer.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                Première connexion détectée
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Vous ne pourrez pas accéder à votre compte tant que vous n'aurez pas défini un nouveau mot de passe sécurisé.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-400 text-sm flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe actuel (temporaire)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Votre mot de passe temporaire"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Minimum 8 caractères"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Force du mot de passe: <span className={passwordStrength >= 3 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}>
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <ul className="mt-2 space-y-1">
                <li className={`text-xs flex items-center ${newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Au moins 8 caractères
                </li>
                <li className={`text-xs flex items-center ${/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Majuscules et minuscules
                </li>
                <li className={`text-xs flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Au moins un chiffre
                </li>
                <li className={`text-xs flex items-center ${/[^a-zA-Z0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Caractère spécial (recommandé)
                </li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Changement en cours...' : 'Changer mon mot de passe'}
            </button>

            <button
              type="button"
              onClick={logout}
              disabled={loading}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
