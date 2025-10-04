import React from 'react';
import { TrendingUp, Users, Package, Truck, Euro, Calendar, AlertCircle, Star } from 'lucide-react';
import { Contact, Order, Delivery, Analytics, Reminder, Product } from '../utils/types';
import { useRealTimeAnalytics } from '../hooks/useRealTimeAnalytics';
import { useRealTimeStats } from '../hooks/useRealTimeStats';
import RealTimeIndicator from './RealTimeIndicator';
import LiveMetricCard from './LiveMetricCard';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import DateFilters from './DateFilters';
import OrdersChart from './OrdersChart';
import { useDateFilteredOrders } from '../hooks/useDateFilteredOrders';
import { DateFilterUtils } from '../utils/dateFilters';
import PeriodComparison from './PeriodComparison';

interface DashboardProps {
  customers: Contact[];
  orders: Order[];
  products: Product[];
  deliveries: Delivery[];
  analytics: Analytics;
  reminders: Reminder[];
  onContactClick: (contact: Contact) => void;
  onReminderComplete: (reminderId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  customers, 
  orders, 
  products,
  deliveries, 
  analytics, 
  reminders, 
  onContactClick, 
  onReminderComplete 
}) => {
  // Utiliser les hooks temps réel pour les analytics et statistiques
  const { analytics: realTimeAnalytics, lastUpdate: analyticsUpdate } = useRealTimeAnalytics({
    contacts: customers,
    orders,
    products
  });
  
  const realTimeStats = useRealTimeStats({
    contacts: customers,
    orders,
    products,
    reminders
  });
  
  const { isOnline, lastOnlineTime } = useConnectionStatus();

  // Hook pour le filtrage par date des commandes dans le dashboard
  const {
    filteredOrders: dashboardFilteredOrders,
    selectedFilter: dashboardDateFilter,
    customStartDate: dashboardCustomStart,
    customEndDate: dashboardCustomEnd,
    periodStats: dashboardPeriodStats,
    chartData: dashboardChartData,
    handleFilterChange: handleDashboardDateFilter,
    handleCustomDateChange: handleDashboardCustomDate
  } = useDateFilteredOrders({ orders, initialFilter: 'month' });

  // Utiliser les analytics temps réel au lieu des props
  const currentAnalytics = realTimeAnalytics;

  // Calculer les livraisons d'aujourd'hui avec la logique existante
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const todayDeliveries = deliveries.filter(delivery => {
    if (!delivery.scheduledDate) return false;
    const deliveryDateStr = new Date(delivery.scheduledDate).toISOString().split('T')[0];
    return deliveryDateStr === todayStr;
  });

  const todayOrderDeliveries = orders.filter(order => {
    if (!order.deliveryDate) return false;
    const deliveryDateStr = new Date(order.deliveryDate).toISOString().split('T')[0];
    return deliveryDateStr === todayStr;
  });

  const totalTodayDeliveries = Math.max(todayDeliveries.length, todayOrderDeliveries.length);

  const displayDeliveries = todayDeliveries.length > 0 ? todayDeliveries : todayOrderDeliveries.map(order => ({
    id: order.id,
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    scheduledDate: order.deliveryDate!,
    status: order.status === 'delivered' ? 'delivered' as const : 'scheduled' as const,
    address: order.deliveryAddress,
    items: order.items,
    deliveryNotes: order.notes
  }));

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    // Convertir en nombre entier et formater avec des espaces pour les milliers
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <RealTimeIndicator 
            isConnected={isOnline} 
            lastUpdate={analyticsUpdate}
          />
        </div>
        <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-2">
          Tableau de Bord Kéfir
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <LiveMetricCard
          title="CA ce mois"
          value={currentAnalytics.monthlyRevenue}
          icon={Euro}
          color="from-emerald-100 to-emerald-200 dark:from-emerald-600/20 dark:to-emerald-700/20 border-emerald-200 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400"
          formatValue={(v) => formatCurrency(v as number)}
          subtitle={isOnline ? "Mis à jour en temps réel" : "Données en cache"}
        />

        <LiveMetricCard
          title="Clients actifs"
          value={currentAnalytics.activeCustomers}
          icon={Users}
          color="from-blue-100 to-blue-200 dark:from-blue-600/20 dark:to-blue-700/20 border-blue-200 dark:border-blue-600/30 text-blue-600 dark:text-blue-400"
          subtitle={`Total: ${currentAnalytics.totalCustomers}`}
        />

        <LiveMetricCard
          title="Commandes en attente"
          value={realTimeStats.pendingOrdersCount}
          icon={Package}
          color="from-purple-100 to-purple-200 dark:from-purple-600/20 dark:to-purple-700/20 border-purple-200 dark:border-purple-600/30 text-purple-600 dark:text-purple-400"
          subtitle="À traiter"
        />

        <LiveMetricCard
          title="Livraisons aujourd'hui"
          value={realTimeStats.todayDeliveriesCount}
          icon={Truck}
          color="from-orange-100 to-orange-200 dark:from-orange-600/20 dark:to-orange-700/20 border-orange-200 dark:border-orange-600/30 text-orange-600 dark:text-orange-400"
          subtitle="Programmées"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Livraisons du jour */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Livraisons d'aujourd'hui ({realTimeStats.todayDeliveriesCount})
              </h3>
            </div>
            <div className="sm:ml-auto">
              <RealTimeIndicator 
                isConnected={isOnline} 
                lastUpdate={realTimeStats.lastUpdate}
                className="text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {displayDeliveries.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
                Aucune livraison programmée aujourd'hui
              </p>
            ) : (
              displayDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className={`w-3 h-3 rounded-full mt-1 sm:mt-2 flex-shrink-0 ${
                    delivery.status === 'delivered' ? 'bg-emerald-500' : 
                    delivery.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white font-medium text-sm sm:text-base truncate">{delivery.customerName}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm truncate">
                      {delivery.address.street}, {delivery.address.city}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      {delivery.status === 'delivered' ? 'Livrée' : 
                       delivery.status === 'in-progress' ? 'En cours' : 'Programmée'} aujourd'hui
                      {(Array.isArray(delivery.items) ? delivery.items : []).length > 0 && ` • ${(Array.isArray(delivery.items) ? delivery.items : []).reduce((sum, item) => sum + (item.totalPrice || 0), 0) > 0 ? 
                        formatCurrency((Array.isArray(delivery.items) ? delivery.items : []).reduce((sum, item) => sum + (item.totalPrice || 0), 0)) : ''}`}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(() => {
                        const items = Array.isArray(delivery.items) ? delivery.items : [];
                        console.log('🔍 Dashboard delivery items:', {
                          deliveryId: delivery.id,
                          hasItems: !!delivery.items,
                          isArray: Array.isArray(delivery.items),
                          itemsLength: items.length,
                          items: delivery.items
                        });
                        
                        if (items.length === 0) {
                          return (
                            <span className="px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-full">
                              ⚠️ Articles manquants
                            </span>
                          );
                        }
                        
                        return items.slice(0, 3).map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-600/20 dark:text-orange-300 text-xs rounded-full"
                        >
                          {item.quantity}x {item.productName}
                        </span>
                        ));
                      })()}
                      {Array.isArray(delivery.items) && delivery.items.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 text-xs rounded-full">
                          +{delivery.items.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alertes importantes */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Alertes
              {(realTimeStats.overduePaymentsCount + realTimeStats.pendingOrdersCount + realTimeStats.activeRemindersCount) > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-xs sm:text-sm rounded-full">
                  {realTimeStats.overduePaymentsCount + realTimeStats.pendingOrdersCount + realTimeStats.activeRemindersCount}
                </span>
              )}
            </h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {realTimeStats.overduePaymentsCount > 0 && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2 text-sm sm:text-base">
                  Paiements en retard ({realTimeStats.overduePaymentsCount})
                </h4>
                {orders.filter(o => o.paymentStatus === 'overdue').slice(0, 3).map((order) => (
                  <p key={order.id} className="text-red-700 dark:text-red-400 text-xs sm:text-sm truncate">
                    {order.customerName} - {formatCurrency(order.totalAmount)}
                  </p>
                ))}
              </div>
            )}

            {realTimeStats.pendingOrdersCount > 0 && (
              <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 text-sm sm:text-base">
                  Commandes à traiter ({realTimeStats.pendingOrdersCount})
                </h4>
                {orders.filter(o => o.status === 'pending').slice(0, 3).map((order) => (
                  <p key={order.id} className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm truncate">
                    {order.customerName} - {formatDate(order.orderDate)}
                  </p>
                ))}
              </div>
            )}

            {realTimeStats.activeRemindersCount > 0 && (
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 text-sm sm:text-base">
                  Rappels en attente ({realTimeStats.activeRemindersCount})
                </h4>
                {reminders.filter(r => !r.completed).slice(0, 3).map((reminder) => (
                  <div key={reminder.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 text-blue-700 dark:text-blue-400 text-xs sm:text-sm mb-1">
                    <span className="truncate">{reminder.contactName} - {reminder.message}</span>
                    <button
                      onClick={() => onReminderComplete(reminder.id)}
                      className="text-xs bg-blue-100 dark:bg-blue-800/30 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 self-start sm:self-auto flex-shrink-0"
                    >
                      Marquer fait
                    </button>
                  </div>
                ))}
              </div>
            )}

            {realTimeStats.overduePaymentsCount === 0 && realTimeStats.pendingOrdersCount === 0 && realTimeStats.activeRemindersCount === 0 && (
              <p className="text-gray-600 dark:text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
                Aucune alerte pour le moment 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Analyse des commandes par période */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analyse des commandes</h3>
        </div>
        
        <DateFilters
          selectedFilter={dashboardDateFilter}
          onFilterChange={handleDashboardDateFilter}
          customStartDate={dashboardCustomStart}
          customEndDate={dashboardCustomEnd}
          onCustomDateChange={handleDashboardCustomDate}
          orderCount={dashboardPeriodStats.orderCount}
          totalRevenue={dashboardPeriodStats.totalRevenue}
          averageOrderValue={dashboardPeriodStats.averageOrderValue}
        />

        {dashboardDateFilter !== 'all' && dashboardChartData.length > 1 && (
          <OrdersChart
            data={dashboardChartData}
            title={`Tendance des commandes - ${DateFilterUtils.getFilterLabel(dashboardDateFilter)}`}
            showRevenue={true}
            showOrderCount={true}
          />
        )}
      </div>

      {/* Comparaison avec la période précédente */}
      <PeriodComparison orders={orders} currentPeriod="month" />

      {/* Top clients et produits */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-6">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Meilleurs clients</h3>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {currentAnalytics.topCustomers.slice(0, 5).map((customer, index) => (
              <div
                key={customer.customerId}
                className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 dark:text-white font-medium text-sm sm:text-base truncate">{customer.customerName}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{customer.orderCount} commandes</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Produits populaires</h3>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {currentAnalytics.topProducts.slice(0, 5).map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 dark:text-white font-medium text-sm sm:text-base truncate">{product.productName}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{product.quantity} vendus</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;