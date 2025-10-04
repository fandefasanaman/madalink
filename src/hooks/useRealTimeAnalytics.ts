import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Contact, Order, Product, Analytics } from '../utils/types';

interface UseRealTimeAnalyticsProps {
  contacts: Contact[];
  orders: Order[];
  products: Product[];
}

export const useRealTimeAnalytics = ({ contacts, orders, products }: UseRealTimeAnalyticsProps) => {
  const { currentUser } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calculer les analytics en temps réel avec useMemo pour optimiser les performances
  const analytics = useMemo((): Analytics => {
    console.log('🔄 Recalculating analytics in real-time...', {
      contactsCount: contacts.length,
      ordersCount: orders.length,
      productsCount: products.length,
      timestamp: new Date().toISOString()
    });

    // Calcul du CA total
    const totalRevenue = contacts.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

    // Calcul du CA mensuel
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = orders
      .filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Clients actifs (ayant commandé dans les 3 derniers mois)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const activeCustomers = contacts.filter(c => 
      c.lastOrderDate && new Date(c.lastOrderDate) >= threeMonthsAgo
    ).length;

    // Valeur moyenne des commandes
    const averageOrderValue = orders.length > 0 
      ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length 
      : 0;

    // Top produits par revenus
    const productStats = new Map<string, { quantity: number; revenue: number; name: string }>();
    
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const existing = productStats.get(item.productId) || { quantity: 0, revenue: 0, name: item.productName };
          productStats.set(item.productId, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.totalPrice,
            name: item.productName
          });
        });
      }
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        quantity: stats.quantity,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top clients par dépenses
    const topCustomers = contacts
      .map(c => ({
        customerId: c.id,
        customerName: c.name,
        totalSpent: c.totalSpent || 0,
        orderCount: orders.filter(o => o.customerId === c.id).length
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Statistiques de livraison (basées sur les commandes)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayOrders = orders.filter(order => {
      if (!order.deliveryDate) return false;
      const deliveryDateStr = new Date(order.deliveryDate).toISOString().split('T')[0];
      return deliveryDateStr === todayStr;
    });

    const deliveryStats = {
      onTime: todayOrders.filter(o => o.status === 'delivered').length,
      delayed: todayOrders.filter(o => o.status === 'confirmed' && new Date(o.deliveryDate!) < new Date()).length,
      failed: todayOrders.filter(o => o.status === 'cancelled').length
    };

    const result = {
      totalRevenue,
      monthlyRevenue,
      totalCustomers: contacts.length,
      activeCustomers,
      averageOrderValue,
      topProducts,
      topCustomers,
      deliveryStats
    };

    console.log('✅ Analytics calculated:', {
      totalRevenue,
      monthlyRevenue,
      totalCustomers: contacts.length,
      activeCustomers,
      topProductsCount: topProducts.length,
      topCustomersCount: topCustomers.length
    });

    return result;
  }, [contacts, orders, products]);

  // Mettre à jour le timestamp à chaque changement
  useEffect(() => {
    setLastUpdate(new Date());
    console.log('📊 Dashboard analytics updated at:', new Date().toLocaleTimeString());
  }, [analytics]);

  return {
    analytics,
    lastUpdate,
    isRealTime: true
  };
};