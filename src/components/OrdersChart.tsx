import React from 'react';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';

interface ChartDataPoint {
  period: string;
  orderCount: number;
  revenue: number;
  date: Date;
}

interface OrdersChartProps {
  data: ChartDataPoint[];
  title?: string;
  showRevenue?: boolean;
  showOrderCount?: boolean;
}

const OrdersChart: React.FC<OrdersChartProps> = ({ 
  data, 
  title = "Évolution des commandes",
  showRevenue = true,
  showOrderCount = true
}) => {
  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune donnée à afficher
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aucune commande trouvée pour cette période
          </p>
        </div>
      </div>
    );
  }

  // Calculer les valeurs max pour la normalisation
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxOrderCount = Math.max(...data.map(d => d.orderCount));

  return (
    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-5 h-5 text-sage-600 dark:text-sage-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      {/* Graphique simple avec barres CSS */}
      <div className="space-y-4">
        {data.map((point, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {formatDate(point.date)}
              </span>
              <div className="flex items-center space-x-4 text-xs">
                {showOrderCount && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-600 dark:text-blue-400">{point.orderCount}</span>
                  </div>
                )}
                {showRevenue && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(point.revenue)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Barres de progression */}
            <div className="space-y-1">
              {showRevenue && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 w-16">CA</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}
              
              {showOrderCount && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-blue-600 dark:text-blue-400 w-16">Cmd</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${maxOrderCount > 0 ? (point.orderCount / maxOrderCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        {showRevenue && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Chiffre d'affaires</span>
          </div>
        )}
        {showOrderCount && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Nombre de commandes</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersChart;