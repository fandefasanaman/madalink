import axios, { AxiosInstance } from 'axios';
import CryptoJS from 'crypto-js';

export interface AlldebridConfig {
  apiKey: string;
  baseUrl: string;
  userAgent: string;
}

export interface UserInfo {
  username: string;
  email: string;
  isPremium: boolean;
  premiumUntil: string;
  quotaLeft: number;
  quotaTotal: number;
}

export interface UnlockResponse {
  success: boolean;
  data?: {
    link: string;
    host: string;
    filename: string;
    filesize: number;
  };
  error?: string;
}

export interface TorrentInfo {
  id: string;
  filename: string;
  size: number;
  status: string;
  progress: number;
  downloadSpeed: number;
  links: string[];
}

class AlldebridService {
  private api: AxiosInstance;
  private config: AlldebridConfig;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey: string) {
    this.config = {
      apiKey: this.encryptApiKey(apiKey),
      baseUrl: 'https://api.alldebrid.com/v4',
      userAgent: 'MadaLink/1.0'
    };

    this.api = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      params: {
        agent: 'MadaLink'
      }
    });

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Alldebrid API Error:', error.response?.data || error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        throw error;
      }
    );
  }

  private encryptApiKey(apiKey: string): string {
    const secretKey = 'madalink-secret-key-2025';
    return CryptoJS.AES.encrypt(apiKey, secretKey).toString();
  }

  private decryptApiKey(encryptedKey: string): string {
    const secretKey = 'madalink-secret-key-2025';
    const bytes = CryptoJS.AES.decrypt(encryptedKey, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async checkAccountStatus(): Promise<UserInfo> {
    const cacheKey = this.getCacheKey('user', {});
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = this.decryptApiKey(this.config.apiKey);
      const response = await this.api.get('/user', {
        params: { apikey: apiKey }
      });
      const userData = response.data.data;

      const userInfo: UserInfo = {
        username: userData.user.username,
        email: userData.user.email,
        isPremium: userData.user.isPremium,
        premiumUntil: userData.user.premiumUntil,
        quotaLeft: userData.user.quotaLeft,
        quotaTotal: userData.user.quotaTotal
      };

      this.setCache(cacheKey, userInfo);
      return userInfo;
    } catch (error: any) {
      console.error('Account status error:', error);
      throw new Error(error.response?.data?.error?.message || 'Impossible de vérifier le statut du compte Alldebrid');
    }
  }

  async unlockLink(originalUrl: string): Promise<UnlockResponse> {
    if (!this.isValidUrl(originalUrl)) {
      return {
        success: false,
        error: 'URL invalide'
      };
    }

    const cacheKey = this.getCacheKey('unlock', { url: originalUrl });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = this.decryptApiKey(this.config.apiKey);
      console.log('Attempting to unlock:', originalUrl);

      const response = await this.api.get('/link/unlock', {
        params: {
          apikey: apiKey,
          link: originalUrl
        }
      });

      console.log('Unlock response:', response.data);

      const result: UnlockResponse = {
        success: true,
        data: {
          link: response.data.data.link,
          host: response.data.data.host,
          filename: response.data.data.filename,
          filesize: response.data.data.filesize
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('Unlock error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur lors du déverrouillage';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async addTorrent(magnetLink: string): Promise<TorrentInfo> {
    try {
      const apiKey = this.decryptApiKey(this.config.apiKey);

      // Vérifier si c'est un fichier .torrent encodé en base64
      if (magnetLink.startsWith('file:')) {
        const parts = magnetLink.split(':');
        const filename = parts[1];
        const base64Content = parts.slice(2).join(':');

        console.log('Adding torrent file:', filename);

        // Convertir base64 en blob
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/x-bittorrent' });

        // Créer FormData pour l'upload
        const formData = new FormData();
        formData.append('files[]', blob, filename);

        // Utiliser l'endpoint pour upload de fichiers
        const response = await this.api.post('/magnet/upload/file',
          formData,
          {
            params: {
              apikey: apiKey
            },
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        console.log('Torrent file upload response:', JSON.stringify(response.data, null, 2));

        // Vérifier la structure de la réponse
        if (!response.data) {
          throw new Error('Pas de données dans la réponse API');
        }

        if (response.data.status === 'error' || response.data.error) {
          const errorMsg = response.data.error?.message || response.data.error || 'Erreur API';
          throw new Error(errorMsg);
        }

        // La structure peut être différente selon l'API
        let torrentData;
        if (response.data.data && response.data.data.files && response.data.data.files.length > 0) {
          torrentData = response.data.data.files[0];
        } else if (response.data.data && response.data.data.magnets && response.data.data.magnets.length > 0) {
          torrentData = response.data.data.magnets[0];
        } else if (response.data.data) {
          torrentData = response.data.data;
        } else {
          console.error('Structure de réponse inattendue:', response.data);
          throw new Error('Format de réponse API non reconnu. Vérifiez la documentation AllDebrid.');
        }

        if (torrentData.error) {
          throw new Error(torrentData.error.message || 'Erreur lors de l\'ajout du fichier torrent');
        }

        return {
          id: torrentData.id || Date.now().toString(),
          filename: torrentData.filename || torrentData.name || filename,
          size: torrentData.size || 0,
          status: torrentData.status || 'queued',
          progress: torrentData.downloaded && torrentData.size ? (torrentData.downloaded / torrentData.size * 100) : 0,
          downloadSpeed: torrentData.downloadSpeed || 0,
          links: torrentData.links || []
        };
      }

      // Sinon, traiter comme un magnet link
      console.log('Adding torrent with magnet:', magnetLink);

      // Encoder le magnet link pour l'URL
      const encodedMagnet = encodeURIComponent(magnetLink);

      const response = await this.api.get('/magnet/upload', {
        params: {
          apikey: apiKey,
          magnets: encodedMagnet
        }
      });

      console.log('Torrent upload response:', JSON.stringify(response.data, null, 2));

      // Vérifier la structure de la réponse
      if (!response.data) {
        throw new Error('Pas de données dans la réponse API');
      }

      if (response.data.status === 'error' || response.data.error) {
        const errorMsg = response.data.error?.message || response.data.error || 'Erreur API';
        throw new Error(errorMsg);
      }

      // La structure peut être différente selon l'API
      let torrentData;
      if (response.data.data && response.data.data.magnets && response.data.data.magnets.length > 0) {
        torrentData = response.data.data.magnets[0];
      } else if (response.data.data && Array.isArray(response.data.data.magnets)) {
        // Même si le tableau est vide, on peut avoir des infos dans data
        if (response.data.data.magnets.length === 0 && response.data.data.id) {
          torrentData = response.data.data;
        } else if (response.data.data.magnets.length > 0) {
          torrentData = response.data.data.magnets[0];
        } else {
          throw new Error('Aucun torrent retourné par l\'API');
        }
      } else if (response.data.data) {
        torrentData = response.data.data;
      } else {
        console.error('Structure de réponse inattendue:', response.data);
        throw new Error('Format de réponse API non reconnu. Vérifiez la documentation AllDebrid.');
      }

      // Vérifier si le torrent a été ajouté avec succès
      if (torrentData.error) {
        throw new Error(torrentData.error.message || torrentData.error || 'Erreur lors de l\'ajout du torrent');
      }

      return {
        id: torrentData.id || Date.now().toString(),
        filename: torrentData.filename || torrentData.name || 'Torrent sans nom',
        size: torrentData.size || 0,
        status: torrentData.status || 'queued',
        progress: torrentData.downloaded && torrentData.size ? (torrentData.downloaded / torrentData.size * 100) : 0,
        downloadSpeed: torrentData.downloadSpeed || 0,
        links: torrentData.links || []
      };
    } catch (error: any) {
      console.error('Error in addTorrent:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur lors de l\'ajout du torrent';
      throw new Error(errorMessage);
    }
  }

  async getTorrentStatus(torrentId: string): Promise<TorrentInfo> {
    try {
      const apiKey = this.decryptApiKey(this.config.apiKey);
      const response = await this.api.get('/magnet/status', {
        params: {
          apikey: apiKey,
          id: torrentId
        }
      });

      const torrentData = response.data.data.magnets;

      return {
        id: torrentData.id,
        filename: torrentData.filename,
        size: torrentData.size,
        status: torrentData.status,
        progress: torrentData.downloaded / torrentData.size * 100,
        downloadSpeed: torrentData.downloadSpeed,
        links: torrentData.links || []
      };
    } catch (error: any) {
      console.error('Error getting torrent status:', error);
      throw new Error('Erreur lors de la vérification du statut du torrent');
    }
  }

  async getUserLinks(page: number = 1): Promise<any[]> {
    try {
      const apiKey = this.decryptApiKey(this.config.apiKey);
      const response = await this.api.get('/user/links', {
        params: {
          apikey: apiKey,
          page
        }
      });
      return response.data.data.links || [];
    } catch (error: any) {
      console.error('Error getting user links:', error);
      throw new Error('Erreur lors de la récupération de l\'historique');
    }
  }

  async getAllTorrentsStatus(): Promise<TorrentInfo[]> {
    try {
      const apiKey = this.decryptApiKey(this.config.apiKey);
      const response = await this.api.get('/magnet/status', {
        params: {
          apikey: apiKey
        }
      });

      const torrentsData = response.data.data.magnets || [];

      return torrentsData.map((torrent: any) => ({
        id: torrent.id,
        filename: torrent.filename,
        size: torrent.size,
        status: torrent.status,
        progress: torrent.downloaded && torrent.size ? (torrent.downloaded / torrent.size * 100) : 0,
        downloadSpeed: torrent.downloadSpeed || 0,
        links: torrent.links || []
      }));
    } catch (error: any) {
      console.error('Error getting all torrents status:', error);
      return [];
    }
  }

  async deleteLink(linkId: string): Promise<boolean> {
    try {
      await this.api.delete(`/user/links?id=${linkId}`);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getSupportedHosts(): string[] {
    return [
      '1fichier.com', 'mega.nz', 'mediafire.com', 'rapidgator.net',
      'uptobox.com', 'turbobit.net', 'nitroflare.com', 'uploaded.net',
      'drive.google.com', 'dropbox.com', 'onedrive.live.com',
      'zippyshare.com', 'sendspace.com', 'depositfiles.com'
    ];
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default AlldebridService;