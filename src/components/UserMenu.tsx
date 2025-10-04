import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700 rounded-xl px-2 sm:px-3 py-2 transition-all duration-200 touch-manipulation"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-sage-600 to-sage-700 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
          {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {currentUser.displayName || 'Utilisateur'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
            {currentUser.email}
          </p>
        </div>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {currentUser.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {currentUser.email}
              </p>
            </div>
            
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Ouvrir les paramètres utilisateur
                }}
                className="flex items-center space-x-2 w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm touch-manipulation"
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres du compte</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm touch-manipulation"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;