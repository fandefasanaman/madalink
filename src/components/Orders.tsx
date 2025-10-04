import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Eye, CreditCard as Edit, Truck, CheckCircle, CreditCard, Download, X, FileDown } from 'lucide-react';
import { Order, Contact, Product } from '../utils/types';
import { pdfService } from '../services/pdfService';
import DateFilters, { DateFilter } from './DateFilters';
import OrdersChart from './OrdersChart';
import { useDateFilteredOrders } from '../hooks/useDateFilteredOrders';
import OrdersExportModal from './OrdersExportModal';

interface OrdersProps {
  orders: Order[];
  customers: Contact[];
  products: Product[];
  onCreateOrder: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onValidateOrder: (order: Order) => void;
  onValidatePayment: (order: Order) => void;
  onShowReceipt: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
}

const Orders: React.FC<OrdersProps> = ({ 
  orders, 
  customers, 
  products, 
  onCreateOrder, 
  onViewOrder, 
  onEditOrder,
  onValidateOrder,
  onValidatePayment,
  onShowReceipt,
  onCancelOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Hook pour le filtrage par date
  const {
    filteredOrders: dateFilteredOrders,
    selectedFilter: dateFilter,
    customStartDate,
    customEndDate,
    periodStats,
    chartData,
    handleFilterChange: handleDateFilterChange,
    handleCustomDateChange,
    exportFilteredOrders,
    filterLabel
  } = useDateFilteredOrders({ orders });
  
  // Informations vendeur par défaut
  const defaultVendorInfo = {
      name: 'Kéfir Madagascar SARL',
      address: 'Lot II M 15 Bis Antanimena, 101 Antananarivo, Madagascar',
      phone: '+261 32 12 345 67',
      email: 'contact@kefir-madagascar.mg',
      nif: '1234567890123',
      stat: '12345 12 2023 0 12345'
  };

  const handleDownloadPDF = (order: Order) => {
    pdfService.downloadReceiptPDF(order, defaultVendorInfo)
      .catch(error => {
        console.error('Erreur téléchargement PDF:', error);
        alert('Erreur lors du téléchargement du reçu PDF');
      });
  };

  const handleCancelOrder = async (order: Order) => {
    const confirmed = confirm(`Êtes-vous sûr de vouloir annuler la commande de ${order.customerName} ?`);
    
    if (confirmed && onCancelOrder) {
      try {
        await onCancelOrder(order);
        alert('Commande annulée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        alert('Erreur lors de l\'annulation de la commande');
      }
    }
  };

  // Appliquer d'abord le filtre de date, puis les autres filtres
  const filteredOrders = dateFilteredOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

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
      year: 'numeric'
    }).format(date);
  };

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };

  const paymentLabels = {
    paid: 'Payé',
    pending: 'En attente',
    overdue: 'En retard'
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Commandes</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Gérez toutes vos commandes de kéfir
            {dateFilter !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-sage-100 text-sage-700 dark:bg-sage-600/20 dark:text-sage-300 text-xs rounded-full">
                {filterLabel}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {dateFilter !== 'all' && filteredOrders.length > 0 && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25 w-full sm:w-auto"
            >
              <FileDown className="w-4 h-4" />
              <span className="text-sm sm:text-base">Exporter</span>
            </button>
          )}
          <button
            onClick={onCreateOrder}
      
            className="flex items-center justify-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-4 py-3 sm:py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Nouvelle commande</span>
          </button>
        </div>
      </div>

      {/* Modal d'export */}
      <OrdersExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        orders={orders}
      />

      {/* Filtres de date */}
      <DateFilters
        selectedFilter={dateFilter}
        onFilterChange={handleDateFilterChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={handleCustomDateChange}
        orderCount={periodStats.orderCount}
        totalRevenue={periodStats.totalRevenue}
        averageOrderValue={periodStats.averageOrderValue}
      />

      {/* Graphique des tendances */}
      {dateFilter !== 'all' && chartData.length > 1 && (
        <OrdersChart
          data={chartData}
          title={`Évolution - ${filterLabel}`}
          showRevenue={true}
          showOrderCount={true}
        />
      )}

      {/* Recherche et filtres */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par client ou numéro de commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <div className="flex items-center space-x-2 lg:flex-shrink-0">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base w-full lg:w-auto"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-3 sm:space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune commande trouvée</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
              {searchTerm ? 'Essayez d\'ajuster vos critères de recherche' : 'Créez votre première commande'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 mb-4">
                <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sage-600 to-sage-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                      Commande N° {order.receiptNumber || `REC-${order.id.toUpperCase()}`}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{order.customerName}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                      {formatDate(order.orderDate)}
                      {order.deliveryDate && ` • Livraison: ${formatDate(order.deliveryDate)}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:items-center sm:space-x-2 sm:flex-shrink-0">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                    {statusLabels[order.status]}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {paymentLabels[order.paymentStatus]}
                  </span>
                </div>
              </div>

              {/* Articles de la commande */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-sage-100 text-sage-700 dark:bg-sage-600/20 dark:text-sage-300 text-xs sm:text-sm rounded-full border border-sage-200 dark:border-sage-600/30 truncate max-w-32 sm:max-w-none"
                    >
                      {item.quantity}x {item.productName}
                    </span>
                    ))
                  ) : (
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 text-xs sm:text-sm rounded-full">
                      Aucun article
                    </span>
                  )}
                  {order.items && Array.isArray(order.items) && order.items.length > 3 && (
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 text-xs sm:text-sm rounded-full">
                      +{order.items.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Truck className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                      {order.deliveryAddress.street}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 truncate">
                      {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Total: {formatCurrency(order.totalAmount)}
                </div>
                
                <div className="flex flex-wrap gap-2 sm:items-center sm:space-x-2">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Voir</span>
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => onValidateOrder(order)}
                      className="flex items-center space-x-1 px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-600/20 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Valider</span>
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order)}
                      className="flex items-center space-x-1 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-600/20 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      <X className="w-4 h-4" />
                      <span>Annuler</span>
                    </button>
                  )}
                  {(order.status === 'confirmed' || order.status === 'delivered') && order.paymentStatus === 'pending' && (
                    <button
                      onClick={() => onValidatePayment(order)}
                      className="flex items-center space-x-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600/20 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="hidden sm:inline">Paiement reçu</span>
                      <span className="sm:hidden">Payé</span>
                    </button>
                  )}
                  <button
                    onClick={() => onEditOrder(order)}
                    className="flex items-center space-x-1 px-3 py-2 text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-sage-100 dark:hover:bg-sage-600/20 rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => onShowReceipt(order)}
                    className="flex items-center space-x-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600/20 rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    <Package className="w-4 h-4" />
                    <span>Reçu</span>
                  </button>
                  {(order.status === 'confirmed' || order.status === 'delivered') && (
                    <button
                      onClick={() => handleDownloadPDF(order)}
                      className="flex items-center space-x-1 px-3 py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-600/20 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </button>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;