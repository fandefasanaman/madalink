export interface UrlValidationResult {
  isValid: boolean;
  host?: string;
  isSupported?: boolean;
  error?: string;
}

export class UrlValidator {
  private static supportedHosts = [
    // Hébergeurs premium populaires
    '1fichier.com', 'mega.nz', 'mediafire.com', 'rapidgator.net',
    'uptobox.com', 'turbobit.net', 'nitroflare.com', 'uploaded.net',
    'drive.google.com', 'dropbox.com', 'onedrive.live.com',
    'zippyshare.com', 'sendspace.com', 'depositfiles.com',
    'filefactory.com', 'hotfile.com', 'fileserve.com',
    'filesonic.com', 'wupload.com', 'filepost.com',
    'extabit.com', 'letitbit.net', 'vip-file.com',
    'shareflare.net', 'ryushare.com', 'bitshare.com',
    'freakshare.com', 'uploadstation.com', 'firedrive.com',
    'putlocker.com', 'sockshare.com', 'novamov.com',
    'movshare.net', 'divxstage.eu', 'stagevu.com',
    'videoweed.es', 'videozer.com', 'nowvideo.eu',
    'youwatch.org', 'thevideo.me', 'allmyvideos.net',
    'streamcloud.eu', 'played.to', 'vidto.me',
    'streamin.to', 'flashx.tv', 'vidzi.tv',
    'openload.co', 'streamango.com', 'rapidvideo.com',
    'vidlox.me', 'upstream.to', 'streamtape.com'
  ];

  static validateUrl(url: string): UrlValidationResult {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        error: 'URL vide ou invalide'
      };
    }

    // Nettoyer l'URL
    const cleanUrl = url.trim();
    
    // Vérifier le format de base
    try {
      const urlObj = new URL(cleanUrl);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Supprimer www. si présent
      const cleanHostname = hostname.replace(/^www\./, '');
      
      // Vérifier si l'hébergeur est supporté
      const isSupported = this.supportedHosts.some(host => 
        cleanHostname === host || cleanHostname.endsWith('.' + host)
      );

      return {
        isValid: true,
        host: cleanHostname,
        isSupported,
        error: isSupported ? undefined : 'Hébergeur non supporté'
      };
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Format d\'URL invalide'
      };
    }
  }

  static isMagnetLink(url: string): boolean {
    return url.toLowerCase().startsWith('magnet:?xt=urn:btih:');
  }

  static isTorrentFile(url: string): boolean {
    return url.toLowerCase().endsWith('.torrent');
  }

  static extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/');
      const lastSegment = segments[segments.length - 1];
      
      if (lastSegment && lastSegment.includes('.')) {
        return decodeURIComponent(lastSegment);
      }
      
      // Fallback: utiliser le nom de domaine
      return urlObj.hostname;
    } catch {
      return 'Fichier inconnu';
    }
  }

  static getSupportedHosts(): string[] {
    return [...this.supportedHosts];
  }

  static getHostCategory(hostname: string): string {
    const categories = {
      'Cloud Storage': ['drive.google.com', 'dropbox.com', 'onedrive.live.com'],
      'Premium Hosts': ['1fichier.com', 'rapidgator.net', 'uptobox.com', 'turbobit.net'],
      'Free Hosts': ['mediafire.com', 'zippyshare.com', 'sendspace.com'],
      'Video Hosts': ['putlocker.com', 'openload.co', 'streamango.com'],
      'Mega': ['mega.nz']
    };

    for (const [category, hosts] of Object.entries(categories)) {
      if (hosts.includes(hostname)) {
        return category;
      }
    }

    return 'Autres';
  }

  static formatUrlForDisplay(url: string, maxLength: number = 50): string {
    if (url.length <= maxLength) return url;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      
      if (hostname.length + pathname.length <= maxLength) {
        return hostname + pathname;
      }
      
      const truncatedPath = pathname.length > 20 
        ? pathname.substring(0, 15) + '...' + pathname.substring(pathname.length - 5)
        : pathname;
        
      return hostname + truncatedPath;
    } catch {
      return url.substring(0, maxLength - 3) + '...';
    }
  }
}

export default UrlValidator;