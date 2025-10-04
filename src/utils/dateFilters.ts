export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export class DateFilterUtils {
  // Obtenir la plage de dates pour un filtre donné
  static getDateRange(filter: DateFilter, customStart?: string, customEnd?: string): DateRange | null {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
        
      case 'week':
        const weekStart = new Date(today);
        // Commencer la semaine le lundi
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekStart.setDate(today.getDate() - daysToMonday);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
        
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
        
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
        return { start: yearStart, end: yearEnd };
        
      case 'custom':
        if (customStart && customEnd) {
          return {
            start: new Date(customStart),
            end: new Date(new Date(customEnd).getTime() + 24 * 60 * 60 * 1000) // Inclure la fin de journée
          };
        }
        return null;
        
      default:
        return null;
    }
  }

  // Filtrer les commandes par date
  static filterOrdersByDate<T extends { orderDate: Date | string }>(
    orders: T[], 
    filter: DateFilter, 
    customStart?: string, 
    customEnd?: string
  ): T[] {
    if (filter === 'all') {
      return orders;
    }

    const dateRange = this.getDateRange(filter, customStart, customEnd);
    if (!dateRange) {
      return orders;
    }

    return orders.filter(order => {
      const orderDate = order.orderDate instanceof Date 
        ? order.orderDate 
        : new Date(order.orderDate);
      
      return orderDate >= dateRange.start && orderDate < dateRange.end;
    });
  }

  // Calculer les statistiques pour une période
  static calculatePeriodStats<T extends { orderDate: Date | string; totalAmount: number }>(
    orders: T[]
  ): {
    orderCount: number;
    totalRevenue: number;
    averageOrderValue: number;
    dailyAverage: number;
    periodLabel: string;
  } {
    const orderCount = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
    
    // Calculer la moyenne quotidienne
    let dailyAverage = 0;
    if (orderCount > 0) {
      const dates = orders.map(order => 
        order.orderDate instanceof Date 
          ? order.orderDate 
          : new Date(order.orderDate)
      );
      
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      dailyAverage = totalRevenue / daysDiff;
    }

    return {
      orderCount,
      totalRevenue,
      averageOrderValue,
      dailyAverage,
      periodLabel: this.getPeriodLabel(orders)
    };
  }

  // Obtenir le label de la période
  private static getPeriodLabel<T extends { orderDate: Date | string }>(orders: T[]): string {
    if (orders.length === 0) return 'Aucune commande';
    
    const dates = orders.map(order => 
      order.orderDate instanceof Date 
        ? order.orderDate 
        : new Date(order.orderDate)
    );
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    };
    
    if (minDate.toDateString() === maxDate.toDateString()) {
      return formatDate(minDate);
    }
    
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  }

  // Obtenir le label d'un filtre
  static getFilterLabel(filter: DateFilter): string {
    switch (filter) {
      case 'today': return 'Aujourd\'hui';
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'year': return 'Cette année';
      case 'custom': return 'Période personnalisée';
      default: return 'Toutes les commandes';
    }
  }

  // Vérifier si une date est dans la plage
  static isDateInRange(date: Date | string, filter: DateFilter, customStart?: string, customEnd?: string): boolean {
    const dateRange = this.getDateRange(filter, customStart, customEnd);
    if (!dateRange) return true;
    
    const checkDate = date instanceof Date ? date : new Date(date);
    return checkDate >= dateRange.start && checkDate < dateRange.end;
  }

  // Grouper les commandes par jour/semaine/mois pour les graphiques
  static groupOrdersByPeriod<T extends { orderDate: Date | string; totalAmount: number }>(
    orders: T[],
    groupBy: 'day' | 'week' | 'month'
  ): Array<{ period: string; orderCount: number; revenue: number; date: Date }> {
    const groups = new Map<string, { orderCount: number; revenue: number; date: Date }>();
    
    orders.forEach(order => {
      const orderDate = order.orderDate instanceof Date 
        ? order.orderDate 
        : new Date(order.orderDate);
      
      let periodKey: string;
      let periodDate: Date;
      
      switch (groupBy) {
        case 'day':
          periodKey = orderDate.toISOString().split('T')[0];
          periodDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
          break;
        case 'week':
          const weekStart = new Date(orderDate);
          const dayOfWeek = orderDate.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          weekStart.setDate(orderDate.getDate() - daysToMonday);
          periodKey = weekStart.toISOString().split('T')[0];
          periodDate = weekStart;
          break;
        case 'month':
          periodKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
          periodDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), 1);
          break;
        default:
          periodKey = orderDate.toISOString().split('T')[0];
          periodDate = orderDate;
      }
      
      const existing = groups.get(periodKey) || { orderCount: 0, revenue: 0, date: periodDate };
      groups.set(periodKey, {
        orderCount: existing.orderCount + 1,
        revenue: existing.revenue + order.totalAmount,
        date: periodDate
      });
    });
    
    return Array.from(groups.entries())
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}