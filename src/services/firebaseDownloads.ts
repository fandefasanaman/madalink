import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DownloadRecord {
  id?: string;
  userId: string;
  filename: string;
  originalUrl: string;
  unlockedUrl: string;
  fileSize: number;
  host: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  downloadSpeed: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  error?: string;
}

export interface TorrentRecord {
  id?: string;
  userId: string;
  magnetLink: string;
  filename: string;
  fileSize: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  downloadSpeed: number;
  files: string[];
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export class FirebaseDownloadsService {
  // Ajouter un téléchargement
  static async addDownload(download: Omit<DownloadRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('FirebaseDownloadsService: Adding download to Firebase:', download);
      const docRef = await addDoc(collection(db, 'downloads'), {
        ...download,
        createdAt: Timestamp.now()
      });
      console.log('FirebaseDownloadsService: Download added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('FirebaseDownloadsService: Error adding download:', error);
      throw new Error('Erreur lors de l\'ajout du téléchargement');
    }
  }

  // Mettre à jour un téléchargement
  static async updateDownload(downloadId: string, updates: Partial<DownloadRecord>): Promise<void> {
    try {
      await updateDoc(doc(db, 'downloads', downloadId), updates);
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du téléchargement');
    }
  }

  // Supprimer un téléchargement
  static async deleteDownload(downloadId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'downloads', downloadId));
    } catch (error) {
      throw new Error('Erreur lors de la suppression du téléchargement');
    }
  }

  // Récupérer l'historique des téléchargements
  static async getUserDownloads(userId: string, limitCount: number = 50): Promise<DownloadRecord[]> {
    try {
      console.log('FirebaseDownloadsService: Fetching downloads for user:', userId, 'limit:', limitCount);
      const q = query(
        collection(db, 'downloads'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      console.log('FirebaseDownloadsService: Found', querySnapshot.size, 'documents');
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DownloadRecord));
      console.log('FirebaseDownloadsService: Returning downloads:', results);
      return results;
    } catch (error) {
      console.error('FirebaseDownloadsService: Error fetching downloads:', error);
      throw new Error('Erreur lors de la récupération de l\'historique');
    }
  }

  // Observer les téléchargements en temps réel
  static onDownloadsChange(userId: string, callback: (downloads: DownloadRecord[]) => void) {
    const q = query(
      collection(db, 'downloads'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (querySnapshot) => {
      const downloads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DownloadRecord));
      callback(downloads);
    });
  }

  // Ajouter un torrent
  static async addTorrent(torrent: Omit<TorrentRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'torrents'), {
        ...torrent,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      throw new Error('Erreur lors de l\'ajout du torrent');
    }
  }

  // Mettre à jour un torrent
  static async updateTorrent(torrentId: string, updates: Partial<TorrentRecord>): Promise<void> {
    try {
      await updateDoc(doc(db, 'torrents', torrentId), updates);
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du torrent');
    }
  }

  // Récupérer les torrents utilisateur
  static async getUserTorrents(userId: string): Promise<TorrentRecord[]> {
    try {
      const q = query(
        collection(db, 'torrents'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TorrentRecord));
    } catch (error) {
      throw new Error('Erreur lors de la récupération des torrents');
    }
  }

  // Statistiques globales (pour admin)
  static async getGlobalStats(): Promise<{
    totalDownloads: number;
    totalUsers: number;
    totalSize: number;
    todayDownloads: number;
  }> {
    try {
      // Récupérer tous les téléchargements
      const downloadsSnapshot = await getDocs(collection(db, 'downloads'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      let totalSize = 0;
      let todayDownloads = 0;

      downloadsSnapshot.docs.forEach(doc => {
        const download = doc.data() as DownloadRecord;
        totalSize += download.fileSize || 0;
        
        if (download.createdAt.toDate() >= today) {
          todayDownloads++;
        }
      });

      return {
        totalDownloads: downloadsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalSize,
        todayDownloads
      };
    } catch (error) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }
}