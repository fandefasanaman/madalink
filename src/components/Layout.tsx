import React from 'react';
import { Home, Users, Clock, Plus, Package, ShoppingCart, BarChart3, Menu, X, Settings } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import RealTimeIndicator from './RealTimeIndicator';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'contacts' | 'orders' | 'products' | 'timeline';
  onTabChange: (tab: 'dashboard' | 'contacts' | 'orders' | 'products' | 'timeline') => void;
  onNewNote: () => void;
  onVendorSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onNewNote, 
  onVendorSettings,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const tabs = [
    { id: 'dashboard' as const, label: 'Tableau de bord', icon: BarChart3 },
    { id: 'contacts' as const, label: 'Clients', icon: Users },
    { id: 'orders' as const, label: 'Commandes', icon: ShoppingCart },
    { id: 'products' as const, label: 'Produits', icon: Package },
    { id: 'timeline' as const, label: 'Mémoire', icon: Clock },
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Fermer le menu mobile après sélection
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">CRM Kéfir</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Gestion de relations clients</p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              <RealTimeIndicator 
                isConnected={true} 
                lastUpdate={new Date()}
                className="flex"
              />
              <UserMenu />
              <button
                onClick={onVendorSettings}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </button>
              <button
                onClick={onNewNote}
                className="flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une note</span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              <ThemeToggle />
              <UserMenu />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-16 sm:top-20 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 transition-all duration-200 border-b-2 font-medium ${
                    isActive
                      ? 'bg-sage-600/20 text-sage-600 dark:text-sage-400 border-sage-600 dark:border-sage-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="lg:hidden overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 transition-all duration-200 border-b-2 min-w-0 ${
                      isActive
                        ? 'bg-sage-600/20 text-sage-600 dark:text-sage-400 border-sage-600 dark:border-sage-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-16 sm:top-20 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-4 space-y-2 min-w-48">
            <button
              onClick={() => {
                onNewNote();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full bg-sage-600 hover:bg-sage-700 text-white px-4 py-3 rounded-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une note</span>
            </button>
            <button
              onClick={() => {
                onVendorSettings();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
    </>
  );
};

export default Layout;