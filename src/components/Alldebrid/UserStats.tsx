import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Clock, HardDrive, Zap, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlldebrid } from '../../hooks/useAlldebrid';
import { UserStatsService, UserStats as UserStatsData } from '../../services/userStatsService';

interface UserStatsProps {
  apiKey?: string;
}

const UserStats: React.FC<UserStatsProps> = ({ apiKey }) => {
  const { user } = useAuth();
  const { userInfo } = useAlldebrid(apiKey);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('UserStats: Loading stats for user:', user.id);
        const userStats = await UserStatsService.calculateUserStats(user.id);
        setStats(userStats);
        console.log('UserStats: Stats loaded:', userStats);
      } catch (error) {
        console.error('UserStats: Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

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

  const formatTime = (hours: number): string => {
    if (hours < 1) return `${Math.floor(hours * 60)}min`;
    if (hours < 24) return `${Math.floor(hours)}h`;
    return `${Math.floor(hours / 24)}j ${Math.floor(hours % 24)}h`;
  };

  const getQuotaPercentage = (): number => {
    if (!userInfo || !userInfo.quotaTotal || userInfo.quotaTotal === 0) return 0;
    return ((userInfo.quotaTotal - userInfo.quotaLeft) / userInfo.quotaTotal) * 100;
  };

  const formatChange = (change: number): string => {
    if (change === 0) return 'Stable';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}% ce mois`;
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total téléchargements',
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      change: formatChange(stats.lastMonthComparison.downloadsChange)
    },
    {
      title: 'Volume total',
      value: formatFileSize(stats.totalCompletedSize),
      icon: HardDrive,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      change: formatChange(stats.lastMonthComparison.sizeChange)
    },
    {
      title: 'Vitesse moyenne',
      value: formatSpeed(stats.averageSpeed),
      icon: Zap,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      change: formatChange(stats.lastMonthComparison.speedChange)
    },
    {
      title: 'Temps d\'utilisation',
      value: formatTime(stats.timeSpent),
      icon: Clock,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      change: formatChange(stats.lastMonthComparison.timeChange)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quota Alldebrid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quota Alldebrid
          </h3>

          {userInfo && userInfo.quotaTotal && userInfo.quotaTotal > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Quota utilisé</span>
                  <span>{formatFileSize(userInfo.quotaTotal - userInfo.quotaLeft)} / {formatFileSize(userInfo.quotaTotal)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getQuotaPercentage()}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {getQuotaPercentage().toFixed(1)}% utilisé
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quota restant</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatFileSize(userInfo.quotaLeft)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                  <p className={`text-lg font-bold ${userInfo.isPremium ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {userInfo.isPremium ? 'Premium' : 'Gratuit'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {user?.plan === 'silver' ? 'Quota Illimité' : 'Aucun quota disponible'}
                </p>
                {userInfo?.isPremium && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Compte Premium Actif
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quota restant</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    Illimité
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                  <p className={`text-lg font-bold ${userInfo?.isPremium ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {userInfo?.isPremium ? 'Premium' : 'Chargement...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Activité récente
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Cette semaine</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {stats.thisWeek.downloads} téléchargements
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {formatFileSize(stats.thisWeek.size)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Ce mois</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {stats.thisMonth.downloads} téléchargements
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400">
                  {formatFileSize(stats.thisMonth.size)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">Hébergeur favori</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Le plus utilisé
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600 dark:text-purple-400">
                  {stats.favoriteHost}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique de progression (placeholder) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Évolution des téléchargements
        </h3>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Graphique d'évolution des téléchargements
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Fonctionnalité disponible prochainement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;