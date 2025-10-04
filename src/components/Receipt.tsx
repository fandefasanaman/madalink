import React from 'react';
import { X, Download, Printer as Print, Calendar, Package, User, ExternalLink } from 'lucide-react';
import { Order } from '../utils/types';
import { VendorInfo } from './VendorSettings';
import { pdfService } from '../services/pdfService';

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  vendorInfo: VendorInfo;
}

const Receipt: React.FC<ReceiptProps> = ({ isOpen, onClose, order, vendorInfo }) => {
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handlePrint = () => {
    pdfService.printReceiptPDF(order, vendorInfo)
      .catch(error => {
        console.error('Erreur impression PDF:', error);
        alert('Erreur lors de l\'impression du reçu');
      });
  };

  const handleDownload = () => {
    pdfService.downloadReceiptPDF(order, vendorInfo)
      .catch(error => {
        console.error('Erreur téléchargement PDF:', error);
        alert('Erreur lors du téléchargement du reçu');
      });
  };

  const handleOpenPDF = () => {
    pdfService.openReceiptPDF(order, vendorInfo)
      .catch(error => {
        console.error('Erreur ouverture PDF:', error);
        alert('Erreur lors de l\'ouverture du reçu');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 print:hidden">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reçu de vente</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenPDF}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Ouvrir le PDF"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Imprimer le PDF"
            >
              <Print className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Télécharger PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Contenu du reçu */}
        <div className="p-8 print:p-4">
          {/* En-tête entreprise */}
          <div className="text-center mb-8 print:mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white print:text-black">
              {vendorInfo.name}
            </h1>
            <div className="mt-2 text-gray-600 dark:text-gray-400 print:text-gray-700">
              <p>{vendorInfo.address}</p>
              <p>Tél: {vendorInfo.phone} | Email: {vendorInfo.email}</p>
              <p>NIF: {vendorInfo.nif} | STAT: {vendorInfo.stat}</p>
            </div>
          </div>

          {/* Informations du reçu */}
          <div className="border-t border-b border-gray-200 dark:border-gray-700 print:border-gray-300 py-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white print:text-black mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Reçu N°
                </h3>
                <p className="text-gray-700 dark:text-gray-300 print:text-gray-700">{order.receiptNumber || `REC-${order.id.toUpperCase()}`}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white print:text-black mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </h3>
                <p className="text-gray-700 dark:text-gray-300 print:text-gray-700">{formatDate(order.orderDate)}</p>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white print:text-black mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Client
            </h3>
            <div className="text-gray-700 dark:text-gray-300 print:text-gray-700">
              <p className="font-medium">{order.customerName}</p>
              {/* Afficher le téléphone du client s'il est disponible */}
              {order.customerPhone && (
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                  Tél: {order.customerPhone}
                </p>
              )}
              <div className="text-sm mt-1">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.postalCode} {order.deliveryAddress.city}</p>
                <p>{order.deliveryAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Détail des articles */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white print:text-black mb-4">Détail de la commande</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                    <th className="text-left py-2 text-gray-900 dark:text-white print:text-black font-medium">Article</th>
                    <th className="text-center py-2 text-gray-900 dark:text-white print:text-black font-medium">Qté</th>
                    <th className="text-right py-2 text-gray-900 dark:text-white print:text-black font-medium">Prix unit.</th>
                    <th className="text-right py-2 text-gray-900 dark:text-white print:text-black font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    console.log('🔍 Receipt - Analyzing order items:', {
                      orderId: order.id,
                      hasItems: !!order.items,
                      isArray: Array.isArray(order.items),
                      itemsLength: order.items ? order.items.length : 0,
                      items: order.items,
                      totalAmount: order.totalAmount,
                      deliveryFee: order.deliveryFee
                    });
                    
                    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="py-8 text-center">
                            <div className="text-red-600 dark:text-red-400 font-medium">
                              ⚠️ PROBLÈME CRITIQUE: Articles manquants
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Total: {formatCurrency(order.totalAmount)} mais aucun article trouvé
                            </div>
                            <div className="text-xs text-gray-400 mt-2 font-mono">
                              Debug: items={JSON.stringify(order.items)}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    
                    return order.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 print:border-gray-200">
                      <td className="py-3 text-gray-700 dark:text-gray-300 print:text-gray-700">{item.productName}</td>
                      <td className="py-3 text-center text-gray-700 dark:text-gray-300 print:text-gray-700">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300 print:text-gray-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white print:text-black">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                    ));
                  })()}
                </tbody>
                {order.deliveryFee && order.deliveryFee > 0 && (
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td colSpan={3} className="py-2 text-right text-gray-700 dark:text-gray-300 font-medium">
                        Frais de livraison
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.deliveryFee)}
                      </td>
                    </tr>
                  </tbody>
                )}
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600 print:border-gray-400">
                    <td colSpan={3} className="py-4 text-right font-bold text-gray-900 dark:text-white print:text-black text-lg">
                      TOTAL GÉNÉRAL
                    </td>
                    <td className="py-4 text-right font-bold text-xl text-sage-600 dark:text-sage-400 print:text-black">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Informations de paiement */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white print:text-black">Méthode de paiement:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300 print:text-gray-700">
                  {order.paymentMethod === 'mvola' ? 'MVola' :
                   order.paymentMethod === 'orange-money' ? 'Orange Money' :
                   order.paymentMethod === 'airtel-money' ? 'Airtel Money' :
                   order.paymentMethod === 'cash' ? 'Espèces' :
                   order.paymentMethod === 'transfer' ? 'Virement' :
                   order.paymentMethod === 'check' ? 'Chèque' :
                   order.paymentMethod}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white print:text-black">Statut:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300 print:text-gray-700">
                  {order.paymentStatus === 'paid' ? 'Payé' : 
                   order.paymentStatus === 'pending' ? 'En attente' : 'En retard'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white print:text-black mb-2">Notes</h3>
              <p className="text-gray-700 dark:text-gray-300 print:text-gray-700 text-sm bg-gray-50 dark:bg-gray-800 print:bg-gray-100 p-3 rounded-lg">
                {order.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 print:text-gray-600 border-t border-gray-200 dark:border-gray-700 print:border-gray-300 pt-4">
            <p>Merci pour votre confiance !</p>
            <p className="mt-1">Ce reçu fait foi de votre achat</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;