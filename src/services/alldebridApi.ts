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
      console.log('Adding torrent with magnet:', magnetLink);

      const response = await this.api.post('/magnet/upload', null, {
        params: {
          apikey: apiKey,
          magnets: [magnetLink]
        }
      });

      console.log('Torrent upload response:', response.data);

      if (!response.data.data || !response.data.data.magnets || response.data.data.magnets.length === 0) {
        throw new Error('Réponse invalide de l\'API Alldebrid');
      }

      const torrentData = response.data.data.magnets[0];

      // Vérifier si le torrent a été ajouté avec succès
      if (torrentData.error) {
        throw new Error(torrentData.error.message || 'Erreur lors de l\'ajout du torrent');
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
      const response = await this.api.get(`/magnet/status?id=${torrentId}`);
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
      throw new Error('Erreur lors de la vérification du statut du torrent');
    }
  }

  async getUserLinks(page: number = 1): Promise<any[]> {
    try {
      const response = await this.api.get(`/user/links?page=${page}`);
      return response.data.data.links;
    } catch (error: any) {
      throw new Error('Erreur lors de la récupération de l\'historique');
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