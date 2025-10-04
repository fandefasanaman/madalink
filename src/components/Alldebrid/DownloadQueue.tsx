import React, { useState, useEffect } from 'react';
import { Download, Pause, Play, Trash2, RotateCcw, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import DownloadQueue, { DownloadItem, DownloadStats } from '../../services/downloadQueue';

interface DownloadQueueProps {
  downloadQueue: DownloadQueue;
}

const DownloadQueueComponent: React.FC<DownloadQueueProps> = ({ downloadQueue }) => {
  const [queue, setQueue] = useState<DownloadItem[]>([]);
  const [stats, setStats] = useState<DownloadStats>({
    totalDownloads: 0,
    completedDownloads: 0,
    totalSize: 0,
    downloadedSize: 0,
    averageSpeed: 0
  });
  const [filter, setFilter] = useState<'all' | 'downloading' | 'completed' | 'error'>('all');

  useEffect(() => {
    const unsubscribeQueue = downloadQueue.onQueueChange(setQueue);
    const unsubscribeStats = downloadQueue.onStatsChange(setStats);

    // Load initial data
    setQueue(downloadQueue.getQueue());
    setStats(downloadQueue.getStats());

    return () => {
      unsubscribeQueue();
      unsubscribeStats();
    };
  }, [downloadQueue]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const formatTime = (seconds: number): string => {
    if (seconds === 0 || !isFinite(seconds)) return '--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'downloading':
        return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'downloading':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const filteredQueue = queue.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleAction = (item: DownloadItem, action: string) => {
    switch (action) {
      case 'pause':
        downloadQueue.pauseDownload(item.id);
        break;
      case 'resume':
        downloadQueue.resumeDownload(item.id);
        break;
      case 'retry':
        downloadQueue.retryDownload(item.id);
        break;
      case 'remove':
        downloadQueue.removeDownload(item.id);
        break;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mr-4">
            <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Queue de téléchargement
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalDownloads} téléchargements • {stats.completedDownloads} terminés
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => downloadQueue.clearCompleted()}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Nettoyer terminés
          </button>
          <button
            onClick={() => downloadQueue.clearAll()}
            className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-200"
          >
            Tout effacer
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalDownloads}
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-300">Total</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completedDownloads}
          </div>
          <div className="text-sm text-green-800 dark:text-green-300">Terminés</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatFileSize(stats.totalSize)}
          </div>
          <div className="text-sm text-purple-800 dark:text-purple-300">Taille totale</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatSpeed(stats.averageSpeed)}
          </div>
          <div className="text-sm text-orange-800 dark:text-orange-300">Vitesse moy.</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center space-x-2 mb-6">
        {[
          { key: 'all', label: 'Tous', count: queue.length },
          { key: 'downloading', label: 'En cours', count: queue.filter(i => i.status === 'downloading').length },
          { key: 'completed', label: 'Terminés', count: queue.filter(i => i.status === 'completed').length },
          { key: 'error', label: 'Erreurs', count: queue.filter(i => i.status === 'error').length }
        ].map(filterOption => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filter === filterOption.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Liste des téléchargements */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun téléchargement dans cette catégorie</p>
          </div>
        ) : (
          filteredQueue.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {item.filename}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{formatFileSize(item.size)}</span>
                      {item.status === 'downloading' && (
                        <>
                          <span>{formatSpeed(item.speed)}</span>
                          <span>ETA: {formatTime(item.eta)}</span>
                        </>
                      )}
                      {item.status === 'completed' && item.completedTime && (
                        <span>
                          Terminé le {new Date(item.completedTime).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                    {item.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Erreur: {item.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status === 'downloading' ? 'Téléchargement' :
                     item.status === 'completed' ? 'Terminé' :
                     item.status === 'paused' ? 'En pause' :
                     item.status === 'error' ? 'Erreur' : 'En attente'}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    {item.status === 'downloading' && (
                      <button
                        onClick={() => handleAction(item, 'pause')}
                        className="p-1 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded"
                        title="Mettre en pause"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    
                    {item.status === 'paused' && (
                      <button
                        onClick={() => handleAction(item, 'resume')}
                        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                        title="Reprendre"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    
                    {item.status === 'error' && (
                      <button
                        onClick={() => handleAction(item, 'retry')}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                        title="Réessayer"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleAction(item, 'remove')}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      title="Supprimer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              {(item.status === 'downloading' || item.status === 'paused' || item.status === 'completed') && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progression: {item.progress.toFixed(1)}%</span>
                    <span>
                      {formatFileSize((item.size * item.progress) / 100)} / {formatFileSize(item.size)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : item.status === 'paused'
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions de téléchargement */}
              {item.status === 'completed' && (
                <div className="mt-3 flex items-center space-x-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Copier le lien
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DownloadQueueComponent;