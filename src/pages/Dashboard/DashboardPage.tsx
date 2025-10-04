import React from 'react';
import { useEffect } from 'react';
import { Download, CreditCard, History, BarChart3, Star, Link2, Upload, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlldebridContext } from '../../contexts/AlldebridContext';
import DownloadQueue from '../../services/downloadQueue';
import DownloadQueueComponent from '../../components/Alldebrid/DownloadQueue';
import LinkUnlocker from '../../components/Alldebrid/LinkUnlocker';
import TorrentManager from '../../components/Alldebrid/TorrentManager';
import AlldebridHistory from '../../components/Alldebrid/AlldebridHistory';
import UserStats from '../../components/Alldebrid/UserStats';
import AlldebridSettings from '../../components/Alldebrid/AlldebridSettings';
import NotificationSystem, { useNotifications } from '../../components/Alldebrid/NotificationSystem';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { adminApiKey } = useAlldebridContext();
  const [activeTab, setActiveTab] = React.useState('download');
  const [alldebridApiKey, setAlldebridApiKey] = React.useState('');
  const [downloadQueue] = React.useState(() => new DownloadQueue());
  const notifications = useNotifications();

  useEffect(() => {
    if (adminApiKey) {
      setAlldebridApiKey(adminApiKey);
    } else if (user?.alldebridApiKey) {
      setAlldebridApiKey(user.alldebridApiKey);
    }
  }, [user, adminApiKey]);

  useEffect(() => {
    (window as any).downloadQueue = downloadQueue;
    (window as any).notifications = notifications;

    return () => {
      delete (window as any).downloadQueue;
      delete (window as any).notifications;
    };
  }, [downloadQueue, notifications]);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'silver': return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
      case 'gold': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-green-500 bg-green-100 dark:bg-green-900/20';
    }
  };

  const getPlanLimit = (plan: string) => {
    switch (plan) {
      case 'bronze': return 50;
      case 'silver': return 'Illimité';
      case 'gold': return 'Illimité';
      default: return 2;
    }
  };

  const stats = [
    {
      title: 'Téléchargements aujourd\'hui',
      value: user?.plan === 'free' ? '1/2' : user?.plan === 'bronze' ? '12/50' : '47',
      icon: Download,
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Crédits restants',
      value: user?.credits || 0,
      icon: CreditCard,
      color: 'text-green-500 bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Plan actuel',
      value: user?.plan?.toUpperCase() || 'FREE',
      icon: Star,
      color: getPlanColor(user?.plan || 'free')
    },
    {
      title: 'Fichiers ce mois',
      value: user?.plan === 'free' ? '8' : user?.plan === 'bronze' ? '342' : '1,247',
      icon: BarChart3,
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  const recentDownloads = [
    {
      name: 'Document_Important.pdf',
      size: '2.4 MB',
      date: 'Il y a 2 heures',
      status: 'Terminé'
    },
    {
      name: 'Video_Tutorial.mp4',
      size: '156 MB',
      date: 'Il y a 5 heures',
      status: 'Terminé'
    },
    {
      name: 'Archive_Photos.zip',
      size: '45 MB',
      date: 'Hier',
      status: 'Terminé'
    },
    {
      name: 'Presentation.pptx',
      size: '8.7 MB',
      date: 'Il y a 2 jours',
      status: 'Terminé'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <NotificationSystem 
        notifications={notifications.notifications}
        onRemove={notifications.removeNotification}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Voici un aperçu de votre activité MadaLink
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Download Form */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'download', label: 'Déverrouilleur', icon: Link2 },
                    { id: 'torrent', label: 'Torrents', icon: Upload },
                    { id: 'queue', label: 'Queue', icon: Download },
                    { id: 'history', label: 'Historique', icon: History },
                    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
                    { id: 'settings', label: 'Config', icon: Settings, adminOnly: true }
                  ]
                    .filter(tab => !tab.adminOnly || user?.isAdmin)
                    .map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-5 w-5 mr-2" />
                        {tab.label}
                      </button>
                    ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'download' && (
              <LinkUnlocker apiKey={alldebridApiKey} />
            )}
            
            {activeTab === 'torrent' && (
              <TorrentManager apiKey={alldebridApiKey} />
            )}
            
            {activeTab === 'queue' && (
              <DownloadQueueComponent downloadQueue={downloadQueue} />
            )}
            
            {activeTab === 'history' && (
              <AlldebridHistory />
            )}
            
            {activeTab === 'stats' && (
              <UserStats apiKey={alldebridApiKey} />
            )}

            {activeTab === 'settings' && (
              <AlldebridSettings onApiKeyChange={setAlldebridApiKey} />
            )}

            {/* Recent Downloads */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Téléchargements récents
                </h2>
                <button className="text-red-600 dark:text-red-400 text-sm font-medium hover:text-red-700 dark:hover:text-red-300">
                  Voir tout
                </button>
              </div>
              
              <div className="space-y-3">
                {recentDownloads.map((download, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {download.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {download.size} • {download.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                      {download.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Votre plan
              </h3>
              
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${getPlanColor(user?.plan || 'free')}`}>
                  <Star className="h-4 w-4 mr-1" />
                  {user?.plan?.toUpperCase() || 'FREE'}
                </div>
                
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {getPlanLimit(user?.plan || 'free')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  téléchargements/jour
                </p>
                
                {user?.plan === 'free' && (
                  <button
                    onClick={() => window.location.href = '/payment'}
                    className="w-full py-2 px-4 bg-gradient-to-r from-red-600 to-green-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-green-700 transition-all duration-200"
                  >
                    Upgrader maintenant
                  </button>
                )}
                
                {user?.expiresAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Expire le {new Date(user.expiresAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Actions rapides
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    console.log('Historique complet clicked');
                    setActiveTab('history');
                  }}
                  className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <History className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Historique complet</span>
                </button>

                <button
                  onClick={() => {
                    console.log('Gérer l\'abonnement clicked');
                    window.location.href = '/payment';
                  }}
                  className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Gérer l'abonnement</span>
                </button>

                <button
                  onClick={() => {
                    console.log('Paramètres clicked');
                    setActiveTab('settings');
                  }}
                  className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Paramètres</span>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/20 dark:to-green-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Besoin d'aide ?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Notre équipe est là pour vous aider en français et malgache.
              </p>
              <button className="w-full py-2 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                Contacter le support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;