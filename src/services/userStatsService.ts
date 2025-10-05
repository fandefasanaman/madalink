import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DownloadRecord } from './firebaseDownloads';

export interface UserStats {
  totalDownloads: number;
  totalSize: number;
  totalCompletedSize: number;
  averageSpeed: number;
  timeSpent: number;
  favoriteHost: string;
  thisMonth: {
    downloads: number;
    size: number;
  };
  thisWeek: {
    downloads: number;
    size: number;
  };
  lastMonthComparison: {
    downloadsChange: number;
    sizeChange: number;
    speedChange: number;
    timeChange: number;
  };
}

export class UserStatsService {
  static async calculateUserStats(userId: string): Promise<UserStats> {
    try {
      console.log('UserStatsService: Calculating stats for user:', userId);

      // Récupérer tous les téléchargements de l'utilisateur
      const downloadsQuery = query(
        collection(db, 'downloads'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(downloadsQuery);
      const allDownloads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DownloadRecord));

      console.log('UserStatsService: Found', allDownloads.length, 'downloads');

      // Calculer les dates limites
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Filtrer par périodes
      const thisWeekDownloads = allDownloads.filter(d =>
        d.createdAt.toDate() >= weekAgo
      );

      const thisMonthDownloads = allDownloads.filter(d =>
        d.createdAt.toDate() >= monthAgo
      );

      const lastMonthDownloads = allDownloads.filter(d => {
        const date = d.createdAt.toDate();
        return date >= twoMonthsAgo && date < monthAgo;
      });

      const completedDownloads = allDownloads.filter(d => d.status === 'completed');

      // Calculer le volume total
      const totalSize = allDownloads.reduce((sum, d) => sum + (d.fileSize || 0), 0);
      const totalCompletedSize = completedDownloads.reduce((sum, d) => sum + (d.fileSize || 0), 0);
      const thisWeekSize = thisWeekDownloads.reduce((sum, d) => sum + (d.fileSize || 0), 0);
      const thisMonthSize = thisMonthDownloads.reduce((sum, d) => sum + (d.fileSize || 0), 0);
      const lastMonthSize = lastMonthDownloads.reduce((sum, d) => sum + (d.fileSize || 0), 0);

      // Calculer la vitesse moyenne (uniquement pour les téléchargements terminés avec vitesse > 0)
      const downloadsWithSpeed = completedDownloads.filter(d => d.downloadSpeed > 0);
      const averageSpeed = downloadsWithSpeed.length > 0
        ? downloadsWithSpeed.reduce((sum, d) => sum + d.downloadSpeed, 0) / downloadsWithSpeed.length
        : 0;

      const lastMonthDownloadsWithSpeed = lastMonthDownloads.filter(d => d.status === 'completed' && d.downloadSpeed > 0);
      const lastMonthAverageSpeed = lastMonthDownloadsWithSpeed.length > 0
        ? lastMonthDownloadsWithSpeed.reduce((sum, d) => sum + d.downloadSpeed, 0) / lastMonthDownloadsWithSpeed.length
        : 0;

      // Calculer le temps d'utilisation (temps entre le premier et dernier téléchargement)
      let timeSpent = 0;
      if (allDownloads.length > 0) {
        const sortedDownloads = [...allDownloads].sort((a, b) =>
          a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
        );
        const firstDownload = sortedDownloads[0].createdAt.toDate();
        const lastDownload = sortedDownloads[sortedDownloads.length - 1].createdAt.toDate();
        timeSpent = (lastDownload.getTime() - firstDownload.getTime()) / (1000 * 60 * 60); // en heures
      }

      // Calculer le temps du mois dernier
      let lastMonthTimeSpent = 0;
      if (lastMonthDownloads.length > 0) {
        const sortedDownloads = [...lastMonthDownloads].sort((a, b) =>
          a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
        );
        const firstDownload = sortedDownloads[0].createdAt.toDate();
        const lastDownload = sortedDownloads[sortedDownloads.length - 1].createdAt.toDate();
        lastMonthTimeSpent = (lastDownload.getTime() - firstDownload.getTime()) / (1000 * 60 * 60);
      }

      // Trouver l'hébergeur favori
      const hostCounts: { [host: string]: number } = {};
      allDownloads.forEach(d => {
        const host = d.host || 'Inconnu';
        hostCounts[host] = (hostCounts[host] || 0) + 1;
      });

      let favoriteHost = 'N/A';
      let maxCount = 0;
      Object.entries(hostCounts).forEach(([host, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteHost = host;
        }
      });

      // Calculer les changements par rapport au mois dernier
      const downloadsChange = lastMonthDownloads.length > 0
        ? ((thisMonthDownloads.length - lastMonthDownloads.length) / lastMonthDownloads.length) * 100
        : thisMonthDownloads.length > 0 ? 100 : 0;

      const sizeChange = lastMonthSize > 0
        ? ((thisMonthSize - lastMonthSize) / lastMonthSize) * 100
        : thisMonthSize > 0 ? 100 : 0;

      const speedChange = lastMonthAverageSpeed > 0
        ? ((averageSpeed - lastMonthAverageSpeed) / lastMonthAverageSpeed) * 100
        : 0;

      const timeChange = lastMonthTimeSpent > 0
        ? ((timeSpent - lastMonthTimeSpent) / lastMonthTimeSpent) * 100
        : 0;

      const stats: UserStats = {
        totalDownloads: allDownloads.length,
        totalSize,
        totalCompletedSize,
        averageSpeed,
        timeSpent,
        favoriteHost,
        thisMonth: {
          downloads: thisMonthDownloads.length,
          size: thisMonthSize
        },
        thisWeek: {
          downloads: thisWeekDownloads.length,
          size: thisWeekSize
        },
        lastMonthComparison: {
          downloadsChange: Math.round(downloadsChange),
          sizeChange: Math.round(sizeChange),
          speedChange: Math.round(speedChange),
          timeChange: Math.round(timeChange)
        }
      };

      console.log('UserStatsService: Calculated stats:', stats);

      return stats;
    } catch (error) {
      console.error('UserStatsService: Error calculating stats:', error);

      // Retourner des stats vides en cas d'erreur
      return {
        totalDownloads: 0,
        totalSize: 0,
        totalCompletedSize: 0,
        averageSpeed: 0,
        timeSpent: 0,
        favoriteHost: 'N/A',
        thisMonth: { downloads: 0, size: 0 },
        thisWeek: { downloads: 0, size: 0 },
        lastMonthComparison: {
          downloadsChange: 0,
          sizeChange: 0,
          speedChange: 0,
          timeChange: 0
        }
      };
    }
  }
}
