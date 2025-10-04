import React, { useState, useEffect } from 'react';
import { History, Download, Trash2, RefreshCw, Calendar, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FirebaseDownloadsService, DownloadRecord } from '../../services/firebaseDownloads';

interface AlldebridHistoryProps {
  // Props vides car on utilise Firebase maintenant
}


const AlldebridHistory: React.FC<AlldebridHistoryProps> = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<DownloadRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHost, setSelectedHost] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'filename' | 'fileSize'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  

  const loadHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const downloads = await FirebaseDownloadsService.getUserDownloads(user.id);
      setHistory(downloads);
      setFilteredHistory(downloads);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  useEffect(() => {
    let filtered = [...history];

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.host.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par hébergeur
    if (selectedHost !== 'all') {
      filtered = filtered.filter(item => item.host === selectedHost);
    }

    // Trier
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'filename':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'fileSize':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'createdAt':
        default:
          comparison = a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, selectedHost, sortBy, sortOrder]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: any): string => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueHosts = (): string[] => {
    const hosts = [...new Set(history.map(item => item.host))];
    return hosts.sort();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const deleteHistoryItem = async (itemId: string) => {
    try {
      await FirebaseDownloadsService.deleteDownload(itemId);
      setHistory(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg mr-4">
            <History className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Historique des téléchargements
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredHistory.length} élément{filteredHistory.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <button
          onClick={loadHistory}
          disabled={isLoading || !user}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Recherche */}
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filtre par hébergeur */}
        <select
          value={selectedHost}
          onChange={(e) => setSelectedHost(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Tous les hébergeurs</option>
          {getUniqueHosts().map(host => (
            <option key={host} value={host}>{host}</option>
          ))}
        </select>

        {/* Tri */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'filename' | 'fileSize')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="createdAt">Trier par date</option>
          <option value="filename">Trier par nom</option>
          <option value="fileSize">Trier par taille</option>
        </select>

        {/* Ordre de tri */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="desc">Plus récent d'abord</option>
          <option value="asc">Plus ancien d'abord</option>
        </select>
      </div>

      {/* Liste de l'historique */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
            <p className="text-gray-600 dark:text-gray-400">Chargement de l'historique...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {history.length === 0 
                ? 'Aucun téléchargement dans l\'historique'
                : 'Aucun résultat pour cette recherche'
              }
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {item.filename}
                </h4>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(item.createdAt)}
                  </span>
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-xs">
                    {item.host}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => copyToClipboard(item.unlockedUrl)}
                  className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                  title="Copier le lien"
                >
                  <Download className="h-4 w-4" />
                </button>
                <a
                  href={item.unlockedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                  title="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => deleteHistoryItem(item.id!)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistiques */}
      {history.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
            Statistiques
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {history.length}
              </span>
              <span className="text-indigo-800 dark:text-indigo-200 ml-1">
                téléchargements
              </span>
            </div>
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {formatFileSize(history.reduce((total, item) => total + item.fileSize, 0))}
              </span>
              <span className="text-indigo-800 dark:text-indigo-200 ml-1">
                au total
              </span>
            </div>
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {getUniqueHosts().length}
              </span>
              <span className="text-indigo-800 dark:text-indigo-200 ml-1">
                hébergeurs
              </span>
            </div>
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {formatFileSize(history.reduce((total, item) => total + item.fileSize, 0) / history.length)}
              </span>
              <span className="text-indigo-800 dark:text-indigo-200 ml-1">
                en moyenne
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlldebridHistory;