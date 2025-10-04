import React, { useState } from 'react';
import { X, CheckCircle, Package, User, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { Order } from '../utils/types';

interface OrderValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onValidate: (orderId: string, paymentStatus: 'paid' | 'pending') => void;
}

const OrderValidationModal: React.FC<OrderValidationModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  onValidate 
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      await onValidate(order.id, paymentStatus);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation de la commande');
    } finally {
      setIsValidating(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mvola': return 'MVola';
      case 'orange-money': return 'Orange Money';
      case 'airtel-money': return 'Airtel Money';
      case 'cash': return 'Espèces';
      case 'transfer': return 'Virement';
      case 'check': return 'Chèque';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Validation de commande
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Commande #{order.id}</p>
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
          {/* Résumé de la commande */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Résumé de la commande</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date de livraison</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.deliveryDate ? formatDate(order.deliveryDate) : 'Non définie'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Méthode de paiement</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getPaymentMethodLabel(order.paymentMethod || 'cash')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Articles commandés</p>
              <div className="space-y-2">
                {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statut du paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Statut du paiement après validation
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="paid"
                  checked={paymentStatus === 'paid'}
                  onChange={(e) => setPaymentStatus(e.target.value as 'paid')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Paiement reçu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Le client a déjà payé la commande
                  </p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="pending"
                  checked={paymentStatus === 'pending'}
                  onChange={(e) => setPaymentStatus(e.target.value as 'pending')}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Paiement en attente</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Le paiement sera effectué à la livraison
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                  Validation de commande
                </h4>
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  Une fois validée, la commande passera au statut "Confirmée" et pourra être préparée pour la livraison. 
                  Cette action ne peut pas être annulée.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
              isValidating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-600/25'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isValidating ? 'animate-pulse' : ''}`} />
            <span>{isValidating ? 'Validation...' : 'Valider la commande'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderValidationModal;