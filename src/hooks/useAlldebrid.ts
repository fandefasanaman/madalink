import { useState, useEffect, useCallback } from 'react';
import AlldebridService, { UserInfo, UnlockResponse, TorrentInfo } from '../services/alldebridApi';
import QuotaMonitor from '../services/quotaMonitor';
import { useAuth } from '../contexts/AuthContext';
import { useAlldebridContext } from '../contexts/AlldebridContext';
import { FirebaseDownloadsService } from '../services/firebaseDownloads';
import { FirebaseAuthService } from '../services/firebaseAuth';

interface UseAlldebridReturn {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  quotaStatus: any;
  unlockLink: (url: string) => Promise<UnlockResponse>;
  addTorrent: (magnetLink: string) => Promise<TorrentInfo>;
  getUserLinks: () => Promise<any[]>;
  refreshUserInfo: () => Promise<void>;
  clearError: () => void;
}

export const useAlldebrid = (apiKey?: string): UseAlldebridReturn => {
  const { user } = useAuth();
  const { adminApiKey } = useAlldebridContext();
  const [alldebridService, setAlldebridService] = useState<AlldebridService | null>(null);
  const [quotaMonitor] = useState(() => new QuotaMonitor());
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);

  // Initialiser le service Alldebrid avec la clé admin
  useEffect(() => {
    const keyToUse = adminApiKey || apiKey;

    if (keyToUse) {
      try {
        const service = new AlldebridService(keyToUse);
        setAlldebridService(service);
        setError(null);
      } catch (err) {
        setError('Erreur lors de l\'initialisation du service Alldebrid');
      }
    } else {
      setAlldebridService(null);
    }
  }, [adminApiKey, apiKey]);

  // Mettre à jour le statut des quotas
  useEffect(() => {
    if (user) {
      const userPlan = user.plan || 'free';
      const status = quotaMonitor.getQuotaStatus(user.id, userPlan);
      console.log('Quota status updated:', status);
      setQuotaStatus(status);
    } else {
      // Si pas d'utilisateur, définir un quota par défaut
      setQuotaStatus({
        linksRemaining: 2,
        torrentsRemaining: 1,
        linksUsed: 0,
        torrentsUsed: 0
      });
    }
  }, [user, quotaMonitor]);

  const refreshUserInfo = useCallback(async () => {
    if (!alldebridService) return;

    setIsLoading(true);
    setError(null);

    try {
      const info = await alldebridService.checkAccountStatus();
      setUserInfo(info);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des informations utilisateur');
    } finally {
      setIsLoading(false);
    }
  }, [alldebridService]);

  const unlockLink = useCallback(async (url: string): Promise<UnlockResponse> => {
    console.log('useAlldebrid.unlockLink called with:', url);
    console.log('Service available:', !!alldebridService);
    console.log('User available:', !!user);

    if (!alldebridService) {
      const error = user?.isAdmin
        ? 'Service Alldebrid non initialisé. Veuillez configurer la clé API dans Config.'
        : 'Service Alldebrid non disponible. Contactez l\'administrateur.';
      setError(error);
      return { success: false, error };
    }

    if (!user) {
      const error = 'Utilisateur non connecté';
      setError(error);
      return { success: false, error };
    }

    // Vérifier les quotas locaux
    if (!quotaMonitor.canUnlockLink(user.id, user.plan)) {
      const error = 'Quota journalier de liens atteint. Upgradez votre plan pour plus de téléchargements.';
      setError(error);
      return {
        success: false,
        error
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling alldebridService.unlockLink...');
      const result = await alldebridService.unlockLink(url);
      console.log('Service returned:', result);

      if (result.success) {
        // Sauvegarder dans Firebase
        try {
          await FirebaseDownloadsService.addDownload({
            userId: user.id,
            filename: result.data?.filename || 'Fichier inconnu',
            originalUrl: url,
            unlockedUrl: result.data?.link || '',
            fileSize: result.data?.filesize || 0,
            host: result.data?.host || '',
            status: 'completed',
            progress: 100,
            downloadSpeed: 0
          });

          // Mettre à jour les statistiques utilisateur
          await FirebaseAuthService.updateDownloadStats(user.id, result.data?.filesize || 0);
        } catch (fbError) {
          console.error('Firebase error (non-critical):', fbError);
          // Continue même si Firebase échoue
        }

        // Enregistrer l'utilisation du quota
        quotaMonitor.recordLinkUnlock(user.id);

        // Mettre à jour le statut des quotas
        const newStatus = quotaMonitor.getQuotaStatus(user.id, user.plan);
        setQuotaStatus(newStatus);
      } else {
        setError(result.error || 'Erreur inconnue');
      }

      return result;
    } catch (err: any) {
      console.error('Exception in unlockLink:', err);
      const errorMessage = err.message || 'Erreur lors du déverrouillage du lien';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [alldebridService, user, quotaMonitor]);

  const addTorrent = useCallback(async (magnetLink: string): Promise<TorrentInfo> => {
    console.log('useAlldebrid.addTorrent called with:', magnetLink);
    console.log('Service available:', !!alldebridService);
    console.log('User available:', !!user);

    if (!alldebridService) {
      const error = user?.isAdmin
        ? 'Service Alldebrid non initialisé. Veuillez configurer la clé API dans Config.'
        : 'Service Alldebrid non disponible. Contactez l\'administrateur.';
      setError(error);
      throw new Error(error);
    }

    if (!user) {
      const error = 'Utilisateur non connecté';
      setError(error);
      throw new Error(error);
    }

    // Vérifier les quotas locaux
    if (!quotaMonitor.canAddTorrent(user.id, user.plan)) {
      const error = 'Quota journalier de torrents atteint. Upgradez votre plan pour plus de téléchargements.';
      setError(error);
      throw new Error(error);
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling alldebridService.addTorrent...');
      const result = await alldebridService.addTorrent(magnetLink);
      console.log('Service returned torrent:', result);

      // Enregistrer dans Firebase
      try {
        await FirebaseDownloadsService.addDownload({
          userId: user.id,
          filename: result.filename,
          originalUrl: magnetLink,
          unlockedUrl: '', // Pas de lien direct pour les torrents initialement
          fileSize: result.size,
          host: 'torrent',
          status: 'pending',
          progress: 0,
          downloadSpeed: 0
        });
      } catch (fbError) {
        console.error('Firebase error (non-critical):', fbError);
      }

      // Enregistrer l'utilisation du quota
      quotaMonitor.recordTorrentAdd(user.id);

      // Mettre à jour le statut des quotas
      const newStatus = quotaMonitor.getQuotaStatus(user.id, user.plan);
      setQuotaStatus(newStatus);

      return result;
    } catch (err: any) {
      console.error('Exception in addTorrent:', err);
      const errorMessage = err.message || 'Erreur lors de l\'ajout du torrent';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [alldebridService, user, quotaMonitor]);

  const getUserLinks = useCallback(async (): Promise<any[]> => {
    if (!alldebridService) {
      throw new Error('Service non initialisé');
    }

    setIsLoading(true);
    setError(null);

    try {
      const links = await alldebridService.getUserLinks();
      return links;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération de l\'historique';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [alldebridService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger les informations utilisateur au démarrage
  useEffect(() => {
    if (alldebridService) {
      refreshUserInfo();
    }
  }, [alldebridService, refreshUserInfo]);

  return {
    userInfo,
    isLoading,
    error,
    quotaStatus,
    unlockLink,
    addTorrent,
    getUserLinks,
    refreshUserInfo,
    clearError
  };
};