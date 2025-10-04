import React from 'react';
import { X, Package, User, Calendar, MapPin, CreditCard, Truck, FileText } from 'lucide-react';
import { Order } from '../utils/types';

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sage-600 to-sage-700 rounded-full flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Commande #{order.id}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{order.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Statuts */}
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {statusLabels[order.status]}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
              {paymentLabels[order.paymentStatus]}
            </span>
          </div>

          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date de commande</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.orderDate)}</p>
                </div>
              </div>
              
              {order.deliveryDate && (
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date de livraison</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.deliveryDate)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Méthode de paiement</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Adresse de livraison</p>
                  <div className="font-medium text-gray-900 dark:text-white">
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.postalCode} {order.deliveryAddress.city}</p>
                    <p>{order.deliveryAddress.country}</p>
                    {order.deliveryAddress.deliveryInstructions && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Instructions: {order.deliveryAddress.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Articles commandés</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Produit</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Quantité</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Prix unitaire</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(() => {
                      console.log('🔍 OrderDetails - Analyzing order items:', {
                        orderId: order.id,
                        hasItems: !!order.items,
                        isArray: Array.isArray(order.items),
                        itemsLength: order.items ? order.items.length : 0,
                        items: order.items,
                        totalAmount: order.totalAmount
                      });
                      
                      if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center">
                              <div className="text-red-600 dark:text-red-400 font-medium">
                                ⚠️ PROBLÈME CRITIQUE: Articles manquants
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Total: {formatCurrency(order.totalAmount)} mais aucun article trouvé
                              </div>
                              <div className="text-xs text-gray-400 mt-2 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                Debug: items={JSON.stringify(order.items)}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      
                      return order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.productName}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                      ));
                    })()}
                  </tbody>
                  {order.deliveryFee && order.deliveryFee > 0 && (
                    <tbody>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="py-2 text-gray-700 dark:text-gray-300 font-medium italic">Frais de livraison</td>
                        <td className="py-2 text-center text-gray-700 dark:text-gray-300">1</td>
                        <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(order.deliveryFee)}</td>
                        <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(order.deliveryFee)}</td>
                      </tr>
                    </tbody>
                  )}
                  <tfoot className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Total général</td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-sage-600 dark:text-sage-400">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Notes</h4>
                  <p className="text-blue-700 dark:text-blue-400">{order.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;