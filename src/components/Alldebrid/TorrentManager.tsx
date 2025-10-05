import React, { useState, useEffect } from 'react';
import { Download, Upload, Trash2, Play, Pause, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAlldebrid } from '../../hooks/useAlldebrid';
import { useLanguage } from '../../contexts/LanguageContext';

interface TorrentManagerProps {
  apiKey?: string;
}

interface TorrentItem {
  id: string;
  filename: string;
  size: number;
  status: string;
  progress: number;
  downloadSpeed: number;
  links: string[];
}

const TorrentManager: React.FC<TorrentManagerProps> = ({ apiKey }) => {
  const [magnetLink, setMagnetLink] = useState('');
  const [torrents, setTorrents] = useState<TorrentItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { addTorrent, quotaStatus, error, clearError } = useAlldebrid(apiKey);
  const { language } = useLanguage();

  const messages = {
    fr: {
      title: 'Gestionnaire de torrents',
      placeholder: 'Collez votre lien magnet ou hash torrent ici',
      add: 'Ajouter torrent',
      adding: 'Ajout en cours...',
      noTorrents: 'Aucun torrent en cours',
      status: 'Statut',
      progress: 'Progression',
      speed: 'Vitesse',
      files: 'Fichiers',
      download: 'Télécharger',
      remove: 'Supprimer',
      quotaRemaining: 'Torrents restants aujourd\'hui',
      unlimited: 'Illimité',
      completed: 'Terminé',
      downloading: 'Téléchargement',
      waiting: 'En attente',
      error: 'Erreur',
      emptyField: 'Veuillez entrer un lien magnet ou hash torrent',
      invalidFormat: 'Format invalide. Utilisez un lien magnet (magnet:?xt=urn:btih:...) ou un hash torrent (40 caractères)',
      success: 'Torrent ajouté avec succès',
      quotaReached: 'Quota journalier atteint. Upgradez votre plan pour plus de torrents.'
    },
    mg: {
      title: 'Mpitantana torrent',
      placeholder: 'Apetaho ny lien magnet na hash torrent eto',
      add: 'Hanampy torrent',
      adding: 'Manampy...',
      noTorrents: 'Tsy misy torrent mandeha',
      status: 'Toe-javatra',
      progress: 'Fivoarana',
      speed: 'Hafainganam-pandeha',
      files: 'Rakitra',
      download: 'Alao',
      remove: 'Esory',
      quotaRemaining: 'Torrent sisa anio',
      unlimited: 'Tsy misy fetra',
      completed: 'Vita',
      downloading: 'Maka',
      waiting: 'Miandry',
      error: 'Tsy mety',
      emptyField: 'Azafady apetaho ny lien magnet na hash',
      invalidFormat: 'Format tsy mety. Mampiasà lien magnet na hash torrent',
      success: 'Torrent nampiana soa aman-tsara',
      quotaReached: 'Tapa ny fetra anio. Miova plan mba hahazo torrent bebe kokoa.'
    }
  };

  const msg = messages[language as keyof typeof messages];

  // Déboguer l'état du bouton
  useEffect(() => {
    const isEmpty = !magnetLink.trim();
    const quotaExceeded = quotaStatus?.torrentsRemaining === 0;
    console.log('=== TorrentManager Debug ===');
    console.log('Magnet link:', magnetLink);
    console.log('Magnet link length:', magnetLink.trim().length);
    console.log('Is adding:', isAdding);
    console.log('Quota status:', quotaStatus);
    console.log('Conditions:', {
      isEmpty,
      isAdding,
      quotaExceeded,
      finalDisabled: isEmpty || isAdding || quotaExceeded
    });
    console.log('===========================');
  }, [magnetLink, isAdding, quotaStatus]);

  const validateTorrentInput = (input: string): { valid: boolean; type: string | null; error?: string } => {
    const trimmed = input.trim();

    if (!trimmed) {
      return { valid: false, type: null, error: msg.emptyField };
    }

    // Vérifier si c'est un lien magnet
    if (trimmed.toLowerCase().startsWith('magnet:?xt=urn:btih:')) {
      return { valid: true, type: 'magnet' };
    }

    // Vérifier si c'est un hash (40 caractères hexadécimaux)
    if (/^[a-fA-F0-9]{40}$/.test(trimmed)) {
      // Convertir le hash en lien magnet
      return { valid: true, type: 'hash' };
    }

    return { valid: false, type: null, error: msg.invalidFormat };
  };

  const handleAddTorrent = async () => {
    const trimmedInput = magnetLink.trim();

    if (!trimmedInput) {
      setValidationError(msg.emptyField);
      return;
    }

    // Valider le format
    const validation = validateTorrentInput(trimmedInput);
    if (!validation.valid) {
      setValidationError(validation.error || msg.invalidFormat);
      return;
    }

    clearError();
    setValidationError(null);
    setIsAdding(true);

    try {
      // Convertir le hash en magnet si nécessaire
      let magnetToUse = trimmedInput;
      if (validation.type === 'hash') {
        magnetToUse = `magnet:?xt=urn:btih:${trimmedInput}`;
      }

      console.log('Adding torrent:', magnetToUse);
      const torrentInfo = await addTorrent(magnetToUse);

      setTorrents(prev => [...prev, torrentInfo]);
      setMagnetLink('');

      // Notification de succès
      if ((window as any).notifications) {
        (window as any).notifications.addNotification({
          type: 'success',
          message: msg.success
        });
      }
    } catch (err: any) {
      console.error('Error adding torrent:', err);
      setValidationError(err.message || 'Erreur lors de l\'ajout du torrent');
    } finally {
      setIsAdding(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'ready':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'downloading':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'waiting':
      case 'queued':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'ready':
        return msg.completed;
      case 'downloading':
        return msg.downloading;
      case 'waiting':
      case 'queued':
        return msg.waiting;
      case 'error':
        return msg.error;
      default:
        return status;
    }
  };

  const removeTorrent = (torrentId: string) => {
    setTorrents(prev => prev.filter(t => t.id !== torrentId));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg mr-4">
          <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {msg.title}
          </h2>
          {quotaStatus && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {msg.quotaRemaining}: {' '}
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {quotaStatus.torrentsRemaining === -1 ? msg.unlimited : quotaStatus.torrentsRemaining}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="space-y-4 mb-6">
        <div>
          <textarea
            value={magnetLink}
            onChange={(e) => setMagnetLink(e.target.value)}
            placeholder={msg.placeholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
            disabled={isAdding}
          />
        </div>

        <button
          onClick={handleAddTorrent}
          disabled={!magnetLink.trim() || isAdding || (quotaStatus?.torrentsRemaining === 0)}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          {isAdding ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              {msg.adding}
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              {msg.add}
            </>
          )}
        </button>
      </div>

      {/* Affichage des erreurs */}
      {(error || validationError) && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error || validationError}</span>
        </div>
      )}

      {/* Avertissement quota atteint */}
      {quotaStatus && quotaStatus.torrentsRemaining === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-yellow-700 dark:text-yellow-400 text-sm">{msg.quotaReached}</span>
        </div>
      )}

      {/* Liste des torrents */}
      <div className="space-y-4">
        {torrents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{msg.noTorrents}</p>
          </div>
        ) : (
          torrents.map((torrent) => (
            <div
              key={torrent.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {torrent.filename}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(torrent.size)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(torrent.status)}`}>
                    {getStatusText(torrent.status)}
                  </span>
                  <button
                    onClick={() => removeTorrent(torrent.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{msg.progress}: {torrent.progress.toFixed(1)}%</span>
                  {torrent.downloadSpeed > 0 && (
                    <span>{msg.speed}: {formatSpeed(torrent.downloadSpeed)}</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${torrent.progress}%` }}
                  />
                </div>
              </div>

              {/* Liens de téléchargement */}
              {torrent.links && torrent.links.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {msg.files} ({torrent.links.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {torrent.links.slice(0, 4).map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {msg.download} {index + 1}
                      </a>
                    ))}
                  </div>
                  {torrent.links.length > 4 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                      +{torrent.links.length - 4} autres fichiers...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TorrentManager;