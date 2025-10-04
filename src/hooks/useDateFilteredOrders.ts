import { useState, useEffect, useMemo } from 'react';
import { Order } from '../utils/types';
import { DateFilter, DateFilterUtils } from '../utils/dateFilters';

interface UseDateFilteredOrdersProps {
  orders: Order[];
  initialFilter?: DateFilter;
}

export const useDateFilteredOrders = ({ orders, initialFilter = 'all' }: UseDateFilteredOrdersProps) => {
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>(initialFilter);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filtrer les commandes selon le filtre sélectionné
  const filteredOrders = useMemo(() => {
    console.log('🔄 Filtering orders by date:', {
      filter: selectedFilter,
      totalOrders: orders.length,
      customStart: customStartDate,
      customEnd: customEndDate
    });

    const filtered = DateFilterUtils.filterOrdersByDate(
      orders, 
      selectedFilter, 
      customStartDate, 
      customEndDate
    );

    console.log('✅ Date filtering completed:', {
      filter: selectedFilter,
      originalCount: orders.length,
      filteredCount: filtered.length,
      filterLabel: DateFilterUtils.getFilterLabel(selectedFilter)
    });

    return filtered;
  }, [orders, selectedFilter, customStartDate, customEndDate]);

  // Calculer les statistiques de la période
  const periodStats = useMemo(() => {
    return DateFilterUtils.calculatePeriodStats(filteredOrders);
  }, [filteredOrders]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    if (filteredOrders.length === 0) return [];
    
    // Déterminer le groupement selon le filtre
    let groupBy: 'day' | 'week' | 'month' = 'day';
    if (selectedFilter === 'year' || filteredOrders.length > 90) {
      groupBy = 'month';
    } else if (selectedFilter === 'month' || filteredOrders.length > 30) {
      groupBy = 'week';
    }
    
    return DateFilterUtils.groupOrdersByPeriod(filteredOrders, groupBy);
  }, [filteredOrders, selectedFilter]);

  // Gérer le changement de filtre
  const handleFilterChange = (filter: DateFilter) => {
    setSelectedFilter(filter);
    
    // Réinitialiser les dates personnalisées si on change de filtre
    if (filter !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  // Gérer le changement de dates personnalisées
  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  // Exporter les commandes filtrées
  const exportFilteredOrders = () => {
    const csvData = filteredOrders.map(order => ({
      'Numéro': order.receiptNumber || order.id,
      'Client': order.customerName,
      'Date': new Date(order.orderDate).toLocaleDateString('fr-FR'),
      'Montant': order.totalAmount,
      'Statut': order.status,
      'Paiement': order.paymentStatus,
      'Méthode': order.paymentMethod || 'Non définie'
    }));

    // Convertir en CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes-${selectedFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    filteredOrders,
    selectedFilter,
    customStartDate,
    customEndDate,
    periodStats,
    chartData,
    handleFilterChange,
    handleCustomDateChange,
    exportFilteredOrders,
    filterLabel: DateFilterUtils.getFilterLabel(selectedFilter)
  };
};