import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Contact, Order, Product } from '../utils/types';

interface RealTimeStats {
  pendingOrdersCount: number;
  todayDeliveriesCount: number;
  overduePaymentsCount: number;
  lowStockProductsCount: number;
  activeRemindersCount: number;
  lastUpdate: Date;
}

interface UseRealTimeStatsProps {
  contacts: Contact[];
  orders: Order[];
  products: Product[];
  reminders: any[];
}

export const useRealTimeStats = ({ contacts, orders, products, reminders }: UseRealTimeStatsProps) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<RealTimeStats>({
    pendingOrdersCount: 0,
    todayDeliveriesCount: 0,
    overduePaymentsCount: 0,
    lowStockProductsCount: 0,
    activeRemindersCount: 0,
    lastUpdate: new Date()
  });

  useEffect(() => {
    console.log('🔄 Recalculating real-time stats...', {
      ordersCount: orders.length,
      productsCount: products.length,
      remindersCount: reminders.length
    });

    // Commandes en attente
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

    // Livraisons d'aujourd'hui
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDeliveriesCount = orders.filter(order => {
      if (!order.deliveryDate) return false;
      const deliveryDateStr = new Date(order.deliveryDate).toISOString().split('T')[0];
      return deliveryDateStr === todayStr;
    }).length;

    // Paiements en retard
    const overduePaymentsCount = orders.filter(o => o.paymentStatus === 'overdue').length;

    // Produits en stock faible
    const lowStockProductsCount = products.filter(p => p.inStock <= p.minStock).length;

    // Rappels actifs
    const activeRemindersCount = reminders.filter(r => !r.completed).length;

    const newStats = {
      pendingOrdersCount,
      todayDeliveriesCount,
      overduePaymentsCount,
      lowStockProductsCount,
      activeRemindersCount,
      lastUpdate: new Date()
    };

    setStats(newStats);

    console.log('📈 Real-time stats updated:', newStats);
  }, [orders, products, reminders]);

  return stats;
};