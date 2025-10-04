import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { Order } from '../utils/types';
import { DateFilterUtils } from '../utils/dateFilters';

interface PeriodComparisonProps {
  orders: Order[];
  currentPeriod: 'week' | 'month' | 'year';
}

const PeriodComparison: React.FC<PeriodComparisonProps> = ({ orders, currentPeriod }) => {
  const comparison = useMemo(() => {
    const now = new Date();
    
    // Calculer les dates pour la période actuelle et précédente
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
    
    switch (currentPeriod) {
      case 'week':
        currentStart = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        currentStart.setDate(now.getDate() - daysToMonday);
        currentStart.setHours(0, 0, 0, 0);
        
        currentEnd = new Date(currentStart);
        currentEnd.setDate(currentStart.getDate() + 7);
        
        previousStart = new Date(currentStart);
        previousStart.setDate(currentStart.getDate() - 7);
        
        previousEnd = new Date(currentStart);
        break;
        
      case 'month':
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
        
      case 'year':
        currentStart = new Date(now.getFullYear(), 0, 1);
        currentEnd = new Date(now.getFullYear() + 1, 0, 1);
        
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Filtrer les commandes pour chaque période
    const currentOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= currentStart && orderDate < currentEnd;
    });

    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= previousStart && orderDate < previousEnd;
    });

    // Calculer les métriques
    const currentStats = DateFilterUtils.calculatePeriodStats(currentOrders);
    const previousStats = DateFilterUtils.calculatePeriodStats(previousOrders);

    // Calculer les variations
    const revenueChange = previousStats.totalRevenue > 0 
      ? ((currentStats.totalRevenue - previousStats.totalRevenue) / previousStats.totalRevenue) * 100
      : currentStats.totalRevenue > 0 ? 100 : 0;

    const orderCountChange = previousStats.orderCount > 0
      ? ((currentStats.orderCount - previousStats.orderCount) / previousStats.orderCount) * 100
      : currentStats.orderCount > 0 ? 100 : 0;

    const avgOrderValueChange = previousStats.averageOrderValue > 0
      ? ((currentStats.averageOrderValue - previousStats.averageOrderValue) / previousStats.averageOrderValue) * 100
      : currentStats.averageOrderValue > 0 ? 100 : 0;

    return {
      current: currentStats,
      previous: previousStats,
      changes: {
        revenue: revenueChange,
        orderCount: orderCountChange,
        avgOrderValue: avgOrderValueChange
      }
    };
  }, [orders, currentPeriod]);

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return { current: 'Cette semaine', previous: 'Semaine précédente' };
      case 'month': return { current: 'Ce mois', previous: 'Mois précédent' };
      case 'year': return { current: 'Cette année', previous: 'Année précédente' };
      default: return { current: 'Période actuelle', previous: 'Période précédente' };
    }
  };

  const labels = getPeriodLabel(currentPeriod);

  return (
    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-5 h-5 text-sage-600 dark:text-sage-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comparaison avec la période précédente
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chiffre d'affaires */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">Chiffre d'affaires</h4>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{labels.current}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(comparison.current.totalRevenue)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{labels.previous}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatCurrency(comparison.previous.totalRevenue)}
              </p>
            </div>
            
            <div className={`flex items-center space-x-1 ${getTrendColor(comparison.changes.revenue)}`}>
              {React.createElement(getTrendIcon(comparison.changes.revenue), { className: "w-4 h-4" })}
              <span className="text-sm font-medium">
                {formatPercentage(comparison.changes.revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Nombre de commandes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">Commandes</h4>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{labels.current}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {comparison.current.orderCount}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{labels.previous}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comparison.previous.orderCount}
              </p>
            </div>
            
            <div className={`flex items-center space-x-1 ${getTrendColor(comparison.changes.orderCount)}`}>
              {React.createElement(getTrendIcon(comparison.changes.orderCount), { className: "w-4 h-4" })}
              <span className="text-sm font-medium">
                {formatPercentage(comparison.changes.orderCount)}
              </span>
            </div>
          </div>
        </div>

        {/* Panier moyen */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">Panier moyen</h4>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{labels.current}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(comparison.current.averageOrderValue)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{labels.previous}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatCurrency(comparison.previous.averageOrderValue)}
              </p>
            </div>
            
            <div className={`flex items-center space-x-1 ${getTrendColor(comparison.changes.avgOrderValue)}`}>
              {React.createElement(getTrendIcon(comparison.changes.avgOrderValue), { className: "w-4 h-4" })}
              <span className="text-sm font-medium">
                {formatPercentage(comparison.changes.avgOrderValue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodComparison;