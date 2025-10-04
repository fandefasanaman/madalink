import React, { useState } from 'react';
import { X, FileDown, Calendar, Filter, CheckCircle } from 'lucide-react';
import { Order } from '../utils/types';
import { DateFilter, DateFilterUtils } from '../utils/dateFilters';

interface OrdersExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

const OrdersExportModal: React.FC<OrdersExportModalProps> = ({ isOpen, onClose, orders }) => {
  const [exportFilter, setExportFilter] = useState<DateFilter>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [includeFields, setIncludeFields] = useState({
    receiptNumber: true,
    customerName: true,
    orderDate: true,
    deliveryDate: true,
    totalAmount: true,
    status: true,
    paymentStatus: true,
    paymentMethod: true,
    items: false,
    address: false,
    notes: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Filtrer les commandes selon la période sélectionnée
      const filteredOrders = DateFilterUtils.filterOrdersByDate(
        orders, 
        exportFilter, 
        customStartDate, 
        customEndDate
      );

      // Préparer les données CSV
      const csvData = filteredOrders.map(order => {
        const row: any = {};
        
        if (includeFields.receiptNumber) row['Numéro de reçu'] = order.receiptNumber || order.id;
        if (includeFields.customerName) row['Client'] = order.customerName;
        if (includeFields.orderDate) row['Date de commande'] = new Date(order.orderDate).toLocaleDateString('fr-FR');
        if (includeFields.deliveryDate) row['Date de livraison'] = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('fr-FR') : '';
        if (includeFields.totalAmount) row['Montant total'] = order.totalAmount;
        if (includeFields.status) row['Statut'] = order.status;
        if (includeFields.paymentStatus) row['Statut paiement'] = order.paymentStatus;
        if (includeFields.paymentMethod) row['Méthode paiement'] = order.paymentMethod || '';
        
        if (includeFields.items) {
          const itemsList = (Array.isArray(order.items) ? order.items : [])
            .map(item => `${item.quantity}x ${item.productName}`)
            .join('; ');
          row['Articles'] = itemsList;
        }
        
        if (includeFields.address) {
          row['Adresse'] = `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`;
        }
        
        if (includeFields.notes) row['Notes'] = order.notes || '';
        
        return row;
      });

      // Convertir en CSV
      if (csvData.length === 0) {
        alert('Aucune commande à exporter pour cette période');
        return;
      }

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Échapper les guillemets et entourer de guillemets si nécessaire
            const escaped = String(value || '').replace(/"/g, '""');
            return `"${escaped}"`;
          }).join(',')
        )
      ].join('\n');

      // Ajouter BOM pour Excel
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Télécharger
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const filterLabel = DateFilterUtils.getFilterLabel(exportFilter).toLowerCase().replace(/\s+/g, '-');
      const filename = `commandes-${filterLabel}-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Feedback utilisateur
      alert(`✅ Export terminé ! ${csvData.length} commandes exportées.`);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des commandes');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const toggleField = (field: keyof typeof includeFields) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const filteredOrdersCount = DateFilterUtils.filterOrdersByDate(
    orders, 
    exportFilter, 
    customStartDate, 
    customEndDate
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <FileDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Exporter les commandes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sélection de période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Calendar className="w-4 h-4 inline mr-1" />
              Période à exporter
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'today' as const, label: 'Aujourd\'hui' },
                { id: 'week' as const, label: 'Cette semaine' },
                { id: 'month' as const, label: 'Ce mois' },
                { id: 'year' as const, label: 'Cette année' },
                { id: 'all' as const, label: 'Toutes' },
                { id: 'custom' as const, label: 'Personnalisé' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setExportFilter(option.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    exportFilter === option.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Dates personnalisées */}
            {exportFilter === 'custom' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Du</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Au</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                <strong>{filteredOrdersCount}</strong> commande{filteredOrdersCount !== 1 ? 's' : ''} 
                {exportFilter !== 'all' ? ` pour ${DateFilterUtils.getFilterLabel(exportFilter).toLowerCase()}` : ' au total'}
              </p>
            </div>
          </div>

          {/* Sélection des champs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Filter className="w-4 h-4 inline mr-1" />
              Champs à inclure
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'receiptNumber', label: 'Numéro de reçu', recommended: true },
                { key: 'customerName', label: 'Nom du client', recommended: true },
                { key: 'orderDate', label: 'Date de commande', recommended: true },
                { key: 'deliveryDate', label: 'Date de livraison', recommended: false },
                { key: 'totalAmount', label: 'Montant total', recommended: true },
                { key: 'status', label: 'Statut commande', recommended: true },
                { key: 'paymentStatus', label: 'Statut paiement', recommended: true },
                { key: 'paymentMethod', label: 'Méthode paiement', recommended: false },
                { key: 'items', label: 'Liste des articles', recommended: false },
                { key: 'address', label: 'Adresse de livraison', recommended: false },
                { key: 'notes', label: 'Notes', recommended: false }
              ].map((field) => (
                <label
                  key={field.key}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={includeFields[field.key as keyof typeof includeFields]}
                    onChange={() => toggleField(field.key as keyof typeof includeFields)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {field.label}
                    </span>
                    {field.recommended && (
                      <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300 text-xs rounded-full">
                        Recommandé
                      </span>
                    )}
                  </div>
                </label>
              ))}
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
            onClick={handleExport}
            disabled={isExporting || filteredOrdersCount === 0}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
              isExporting || filteredOrdersCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25'
            }`}
          >
            <FileDown className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
            <span>
              {isExporting ? 'Export en cours...' : `Exporter ${filteredOrdersCount} commande${filteredOrdersCount !== 1 ? 's' : ''}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersExportModal;