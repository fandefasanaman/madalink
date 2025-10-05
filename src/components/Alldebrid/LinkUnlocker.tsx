import React, { useState } from 'react';
import { Link2, Download, Copy, AlertCircle, CheckCircle, Loader, ExternalLink } from 'lucide-react';
import { useAlldebrid } from '../../hooks/useAlldebrid';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { FirebaseDownloadsService } from '../../services/firebaseDownloads';

interface LinkUnlockerProps {
  apiKey?: string;
}

const LinkUnlocker: React.FC<LinkUnlockerProps> = ({ apiKey }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [unlockedLink, setUnlockedLink] = useState<any>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { unlockLink, quotaStatus, error, clearError } = useAlldebrid(apiKey);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const messages = {
    fr: {
      title: 'Déverrouilleur de liens premium',
      placeholder: 'Collez votre lien ici (1fichier, Mega, RapidGator, etc.)',
      unlock: 'Générer lien premium',
      unlocking: 'Génération du lien premium...',
      success: 'Lien premium généré avec succès !',
      quotaExceeded: 'Quota journalier atteint',
      invalidLink: 'Lien non valide ou non supporté',
      copy: 'Copier le lien',
      download: 'Télécharger',
      copied: 'Lien copié !',
      quotaRemaining: 'Liens restants aujourd\'hui',
      unlimited: 'Illimité',
      fileInfo: 'Informations du fichier'
    },
    mg: {
      title: 'Mpamaha lien premium',
      placeholder: 'Apetaho ny lien-nao eto (1fichier, Mega, RapidGator, sns.)',
      unlock: 'Mamorona lien premium',
      unlocking: 'Mamorona lien premium...',
      success: 'Lien premium vita soa aman-tsara !',
      quotaExceeded: 'Quota isan\'andro vita',
      invalidLink: 'Lien tsy mety na tsy raisina',
      copy: 'Adikao ny lien',
      download: 'Alao',
      copied: 'Lien nadika !',
      quotaRemaining: 'Lien sisa anio',
      unlimited: 'Tsy misy fetra',
      fileInfo: 'Mombamomba ny rakitra'
    }
  };

  const msg = messages[language as keyof typeof messages];

  const handleUnlock = async () => {
    if (!inputUrl.trim()) return;

    console.log('Starting unlock process for:', inputUrl.trim());
    console.log('API Key available:', !!apiKey);

    clearError();
    setIsUnlocking(true);
    setUnlockedLink(null);

    try {
      const result = await unlockLink(inputUrl.trim());
      console.log('Unlock result:', result);

      if (result.success && result.data) {
        console.log('Link unlocked successfully:', result.data);
        setUnlockedLink(result.data);

        // Ajouter à la queue de téléchargement si disponible
        // L'enregistrement Firebase est déjà fait dans useAlldebrid hook
        if (window.downloadQueue) {
          window.downloadQueue.addDownload(
            result.data.filename,
            result.data.link,
            inputUrl.trim(),
            result.data.filesize,
            result.data.host
          );
        }

        // Déclencher le téléchargement automatiquement
        startDownload(result.data.link, result.data.filename);

        // Notification de succès
        if (window.notifications) {
          window.notifications.notifySuccess(
            'Lien déverrouillé !',
            `${result.data.filename} est prêt à télécharger`
          );
        }
      } else {
        console.error('Unlock failed:', result.error);
        // L'erreur sera gérée par le hook
      }
    } catch (err) {
      console.error('Unlock exception:', err);
      // L'erreur sera gérée par le hook
      if (window.notifications) {
        window.notifications.notifyError(
          'Erreur de déverrouillage',
          'Impossible de déverrouiller ce lien'
        );
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const startDownload = (url: string, filename: string) => {
    // Créer un élément <a> temporaire pour déclencher le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // Ajouter au DOM, cliquer, puis retirer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Afficher une notification de succès
      const button = document.getElementById('copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = msg.copied;
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSupportedHosts = () => [
    '1fichier.com', 'mega.nz', 'mediafire.com', 'rapidgator.net',
    'uptobox.com', 'turbobit.net', 'nitroflare.com', 'uploaded.net',
    'drive.google.com', 'dropbox.com', 'onedrive.live.com'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-red-100 to-green-100 dark:from-red-900/20 dark:to-green-900/20 rounded-lg mr-4">
          <Link2 className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {msg.title}
          </h2>
          {quotaStatus && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {msg.quotaRemaining}: {' '}
              <span className="font-medium text-red-600 dark:text-red-400">
                {quotaStatus.linksRemaining === -1 ? msg.unlimited : quotaStatus.linksRemaining}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Formulaire de déverrouillage */}
      <div className="space-y-4">
        <div>
          <div className="relative">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder={msg.placeholder}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
              disabled={isUnlocking}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <button
          onClick={handleUnlock}
          disabled={!inputUrl.trim() || isUnlocking || (quotaStatus && quotaStatus.linksRemaining === 0)}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-green-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          {isUnlocking ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              {msg.unlocking}
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              {msg.unlock}
            </>
          )}
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Lien déverrouillé */}
      {unlockedLink && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center mb-3">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-800 dark:text-green-200 font-medium">{msg.success}</span>
          </div>

          {/* Informations du fichier */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{msg.fileInfo}</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Nom:</span>
                <span className="font-medium text-gray-900 dark:text-white">{unlockedLink.filename}</span>
              </div>
              <div className="flex justify-between">
                <span>Taille:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatFileSize(unlockedLink.filesize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hébergeur:</span>
                <span className="font-medium text-gray-900 dark:text-white">{unlockedLink.host}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="copy-button"
              onClick={() => copyToClipboard(unlockedLink.link)}
              className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              {msg.copy}
            </button>
            <a
              href={unlockedLink.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {msg.download}
            </a>
            <button
              onClick={() => {
                if (window.downloadQueue) {
                  window.downloadQueue.addDownload(
                    unlockedLink.filename,
                    unlockedLink.link,
                    inputUrl.trim(),
                    unlockedLink.filesize
                  );
                  
                  if (window.notifications) {
                    window.notifications.notifyInfo(
                      'Ajouté à la queue',
                      `${unlockedLink.filename} a été ajouté à la queue de téléchargement`
                    );
                  }
                }
              }}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Ajouter à la queue
            </button>
          </div>
        </div>
      )}

      {/* Hébergeurs supportés */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Hébergeurs supportés
        </h4>
        <div className="flex flex-wrap gap-2">
          {getSupportedHosts().map((host) => (
            <span
              key={host}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full"
            >
              {host}
            </span>
          ))}
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
            +80 autres...
          </span>
        </div>
      </div>
    </div>
  );
};

export default LinkUnlocker;