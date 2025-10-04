import React from 'react';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';

export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

interface DateFiltersProps {
  selectedFilter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
  orderCount?: number;
  totalRevenue?: number;
  averageOrderValue?: number;
}

const DateFilters: React.FC<DateFiltersProps> = ({
  selectedFilter,
  onFilterChange,
  customStartDate = '',
  customEndDate = '',
  onCustomDateChange,
  orderCount = 0,
  totalRevenue = 0,
  averageOrderValue = 0
}) => {
  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  };

  const filterOptions = [
    { id: 'all' as const, label: 'Toutes', icon: BarChart3 },
    { id: 'today' as const, label: 'Aujourd\'hui', icon: Clock },
    { id: 'week' as const, label: 'Cette semaine', icon: Calendar },
    { id: 'month' as const, label: 'Ce mois', icon: Calendar },
    { id: 'year' as const, label: 'Cette année', icon: TrendingUp },
    { id: 'custom' as const, label: 'Personnalisé', icon: Calendar }
  ];

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    if (onCustomDateChange) {
      if (field === 'start') {
        onCustomDateChange(value, customEndDate);
      } else {
        onCustomDateChange(customStartDate, value);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistiques de la période */}
      {selectedFilter !== 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300">
                  {orderCount}
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  Commandes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-lg sm:text-xl font-semibold text-emerald-800 dark:text-emerald-300">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                  Chiffre d'affaires
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-lg sm:text-xl font-semibold text-purple-800 dark:text-purple-300">
                  {formatCurrency(averageOrderValue)}
                </p>
                <p className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm">
                  Panier moyen
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres de date */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-sage-600 dark:text-sage-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Filtrer par période</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = selectedFilter === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => onFilterChange(option.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                    isActive
                      ? 'bg-sage-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sélecteur de date personnalisé */}
          {selectedFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Du</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Au</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateFilters;