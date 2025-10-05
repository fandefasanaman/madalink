interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  originalUrl: string;
  size: number;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'paused';
  speed: number;
  eta: number;
  startTime: number;
  completedTime?: number;
  error?: string;
  host?: string;
  userId?: string;
  firebaseId?: string;
}

interface DownloadStats {
  totalDownloads: number;
  completedDownloads: number;
  totalSize: number;
  downloadedSize: number;
  averageSpeed: number;
}

class DownloadQueue {
  private queue: DownloadItem[] = [];
  private activeDownloads: Map<string, DownloadItem> = new Map();
  private maxConcurrentDownloads = 3;
  private listeners: Set<(queue: DownloadItem[]) => void> = new Set();
  private statsListeners: Set<(stats: DownloadStats) => void> = new Set();
  private userId: string | null = null;

  constructor() {
    this.loadQueueFromStorage();
    this.startQueueProcessor();
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  private loadQueueFromStorage(): void {
    const stored = localStorage.getItem('madalink_download_queue');
    if (stored) {
      try {
        this.queue = JSON.parse(stored);
        // Reset status for items that were downloading
        this.queue.forEach(item => {
          if (item.status === 'downloading') {
            item.status = 'pending';
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement de la queue:', error);
      }
    }
  }

  private saveQueueToStorage(): void {
    localStorage.setItem('madalink_download_queue', JSON.stringify(this.queue));
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.queue]));
    this.notifyStatsListeners();
  }

  private notifyStatsListeners(): void {
    const stats = this.getStats();
    this.statsListeners.forEach(listener => listener(stats));
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  private async processQueue(): void {
    const pendingItems = this.queue.filter(item => item.status === 'pending');
    const availableSlots = this.maxConcurrentDownloads - this.activeDownloads.size;

    for (let i = 0; i < Math.min(pendingItems.length, availableSlots); i++) {
      const item = pendingItems[i];
      this.startDownload(item);
    }

    // Update progress for active downloads
    this.updateActiveDownloads();
  }

  private async startDownload(item: DownloadItem): Promise<void> {
    item.status = 'downloading';
    item.startTime = Date.now();
    this.activeDownloads.set(item.id, item);
    this.notifyListeners();

    try {
      // Simulate download progress
      await this.simulateDownload(item);

      item.status = 'completed';
      item.progress = 100;
      item.completedTime = Date.now();
      this.activeDownloads.delete(item.id);

      // Enregistrer dans Firebase
      await this.saveToFirebase(item);
    } catch (error) {
      item.status = 'error';
      item.error = error instanceof Error ? error.message : 'Erreur de téléchargement';
      this.activeDownloads.delete(item.id);
    }

    this.saveQueueToStorage();
    this.notifyListeners();
  }

  private async saveToFirebase(item: DownloadItem): Promise<void> {
    if (!this.userId) {
      console.warn('Cannot save to Firebase: no userId set');
      return;
    }

    try {
      const { FirebaseDownloadsService } = await import('./firebaseDownloads');
      const { Timestamp } = await import('firebase/firestore');

      const firebaseId = await FirebaseDownloadsService.addDownload({
        userId: this.userId,
        filename: item.filename,
        originalUrl: item.originalUrl,
        unlockedUrl: item.url,
        fileSize: item.size,
        host: item.host || this.extractHost(item.originalUrl),
        status: 'completed',
        progress: 100,
        downloadSpeed: 0
      });

      item.firebaseId = firebaseId;
      console.log('Download saved to Firebase:', firebaseId);
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }
  }

  private extractHost(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  private async simulateDownload(item: DownloadItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (item.status === 'paused') return;
        
        if (item.status === 'error') {
          clearInterval(interval);
          reject(new Error(item.error || 'Download failed'));
          return;
        }

        // Simulate progress
        const increment = Math.random() * 5 + 1;
        item.progress = Math.min(100, item.progress + increment);
        
        // Simulate speed
        item.speed = Math.random() * 2000000 + 500000; // 0.5-2.5 MB/s
        
        // Calculate ETA
        const remainingProgress = 100 - item.progress;
        const remainingSize = (item.size * remainingProgress) / 100;
        item.eta = remainingSize / item.speed;

        this.notifyListeners();

        if (item.progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  }

  private updateActiveDownloads(): void {
    // Update active downloads progress
    this.activeDownloads.forEach(item => {
      // Progress is updated in simulateDownload
    });
  }

  addDownload(filename: string, url: string, originalUrl: string, size: number, host?: string): string {
    const id = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const downloadItem: DownloadItem = {
      id,
      filename,
      url,
      originalUrl,
      size,
      progress: 0,
      status: 'pending',
      speed: 0,
      eta: 0,
      startTime: Date.now(),
      host: host || this.extractHost(originalUrl),
      userId: this.userId || undefined
    };

    this.queue.push(downloadItem);
    this.saveQueueToStorage();
    this.notifyListeners();

    return id;
  }

  removeDownload(id: string): void {
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      const item = this.queue[index];
      if (item.status === 'downloading') {
        item.status = 'error';
        this.activeDownloads.delete(id);
      }
      this.queue.splice(index, 1);
      this.saveQueueToStorage();
      this.notifyListeners();
    }
  }

  pauseDownload(id: string): void {
    const item = this.queue.find(item => item.id === id);
    if (item && item.status === 'downloading') {
      item.status = 'paused';
      this.notifyListeners();
    }
  }

  resumeDownload(id: string): void {
    const item = this.queue.find(item => item.id === id);
    if (item && item.status === 'paused') {
      item.status = 'pending';
      this.notifyListeners();
    }
  }

  retryDownload(id: string): void {
    const item = this.queue.find(item => item.id === id);
    if (item && item.status === 'error') {
      item.status = 'pending';
      item.progress = 0;
      item.error = undefined;
      this.notifyListeners();
    }
  }

  clearCompleted(): void {
    this.queue = this.queue.filter(item => item.status !== 'completed');
    this.saveQueueToStorage();
    this.notifyListeners();
  }

  clearAll(): void {
    // Stop active downloads
    this.activeDownloads.forEach(item => {
      item.status = 'error';
    });
    this.activeDownloads.clear();
    
    this.queue = [];
    this.saveQueueToStorage();
    this.notifyListeners();
  }

  getQueue(): DownloadItem[] {
    return [...this.queue];
  }

  getStats(): DownloadStats {
    const totalDownloads = this.queue.length;
    const completedDownloads = this.queue.filter(item => item.status === 'completed').length;
    const totalSize = this.queue.reduce((sum, item) => sum + item.size, 0);
    const downloadedSize = this.queue.reduce((sum, item) => {
      return sum + (item.size * item.progress / 100);
    }, 0);
    
    const activeDownloads = this.queue.filter(item => item.status === 'downloading');
    const averageSpeed = activeDownloads.length > 0 
      ? activeDownloads.reduce((sum, item) => sum + item.speed, 0) / activeDownloads.length
      : 0;

    return {
      totalDownloads,
      completedDownloads,
      totalSize,
      downloadedSize,
      averageSpeed
    };
  }

  onQueueChange(listener: (queue: DownloadItem[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatsChange(listener: (stats: DownloadStats) => void): () => void {
    this.statsListeners.add(listener);
    return () => this.statsListeners.delete(listener);
  }

  setMaxConcurrentDownloads(max: number): void {
    this.maxConcurrentDownloads = Math.max(1, Math.min(10, max));
  }
}

export default DownloadQueue;
export type { DownloadItem, DownloadStats };