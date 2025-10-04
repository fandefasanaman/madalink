export interface FileInfo {
  name: string;
  extension: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'archive' | 'executable' | 'other';
  size?: number;
  icon: string;
}

export class FileHelpers {
  private static fileTypes = {
    video: {
      extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'mpg', 'mpeg'],
      icon: '🎬'
    },
    audio: {
      extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'],
      icon: '🎵'
    },
    image: {
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico'],
      icon: '🖼️'
    },
    document: {
      extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'xls', 'xlsx', 'ppt', 'pptx'],
      icon: '📄'
    },
    archive: {
      extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg'],
      icon: '📦'
    },
    executable: {
      extensions: ['exe', 'msi', 'deb', 'rpm', 'pkg', 'dmg', 'app'],
      icon: '⚙️'
    }
  };

  static analyzeFile(filename: string, size?: number): FileInfo {
    const name = filename || 'Fichier inconnu';
    const lastDotIndex = name.lastIndexOf('.');
    const extension = lastDotIndex > 0 ? name.substring(lastDotIndex + 1).toLowerCase() : '';
    
    let type: FileInfo['type'] = 'other';
    let icon = '📁';

    // Déterminer le type de fichier
    for (const [fileType, config] of Object.entries(this.fileTypes)) {
      if (config.extensions.includes(extension)) {
        type = fileType as FileInfo['type'];
        icon = config.icon;
        break;
      }
    }

    return {
      name,
      extension,
      type,
      size,
      icon
    };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatDuration(seconds: number): string {
    if (seconds === 0 || !isFinite(seconds)) return '--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  static getFileTypeColor(type: FileInfo['type']): string {
    const colors = {
      video: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      audio: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      image: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      document: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      archive: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      executable: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
      other: 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    };

    return colors[type] || colors.other;
  }

  static isVideoFile(filename: string): boolean {
    const info = this.analyzeFile(filename);
    return info.type === 'video';
  }

  static isAudioFile(filename: string): boolean {
    const info = this.analyzeFile(filename);
    return info.type === 'audio';
  }

  static isImageFile(filename: string): boolean {
    const info = this.analyzeFile(filename);
    return info.type === 'image';
  }

  static isArchiveFile(filename: string): boolean {
    const info = this.analyzeFile(filename);
    return info.type === 'archive';
  }

  static generateSafeFilename(filename: string): string {
    // Supprimer les caractères dangereux
    const unsafe = /[<>:"/\\|?*\x00-\x1f]/g;
    const safe = filename.replace(unsafe, '_');
    
    // Limiter la longueur
    const maxLength = 255;
    if (safe.length > maxLength) {
      const extension = safe.substring(safe.lastIndexOf('.'));
      const nameWithoutExt = safe.substring(0, safe.lastIndexOf('.'));
      const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3) + '...';
      return truncatedName + extension;
    }
    
    return safe;
  }

  static extractArchiveInfo(filename: string): { isArchive: boolean; parts?: number; partNumber?: number } {
    const info = this.analyzeFile(filename);
    
    if (info.type !== 'archive') {
      return { isArchive: false };
    }

    // Détecter les archives multi-parties
    const multiPartPatterns = [
      /\.part(\d+)\.rar$/i,
      /\.r(\d+)$/i,
      /\.(\d+)$/i,
      /\.zip\.(\d+)$/i
    ];

    for (const pattern of multiPartPatterns) {
      const match = filename.match(pattern);
      if (match) {
        return {
          isArchive: true,
          partNumber: parseInt(match[1], 10)
        };
      }
    }

    return { isArchive: true };
  }

  static suggestDownloadOrder(files: string[]): string[] {
    // Trier les fichiers par priorité de téléchargement
    return files.sort((a, b) => {
      const aInfo = this.analyzeFile(a);
      const bInfo = this.analyzeFile(b);
      
      // Priorité par type
      const typePriority = {
        video: 1,
        audio: 2,
        image: 3,
        document: 4,
        archive: 5,
        executable: 6,
        other: 7
      };
      
      const aPriority = typePriority[aInfo.type];
      const bPriority = typePriority[bInfo.type];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Ensuite par nom
      return a.localeCompare(b);
    });
  }

  static estimateDownloadTime(fileSize: number, speedBytesPerSecond: number): number {
    if (speedBytesPerSecond <= 0) return 0;
    return fileSize / speedBytesPerSecond;
  }

  static calculateProgress(downloaded: number, total: number): number {
    if (total <= 0) return 0;
    return Math.min(100, (downloaded / total) * 100);
  }
}

export default FileHelpers;