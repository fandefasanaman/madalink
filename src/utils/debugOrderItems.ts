// Utilitaire de debug pour analyser les problèmes d'articles de commande
import { Order } from './types';

export class OrderItemsDebugger {
  static analyzeOrder(order: Order): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
    debugInfo: any;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    console.group(`🔍 ANALYSE COMMANDE ${order.id}`);
    console.log('📊 Données brutes:', order);
    
    // Vérifier la présence des items
    if (!order.items) {
      issues.push('Propriété "items" manquante');
      suggestions.push('Ajouter une propriété items: OrderItem[]');
    } else if (!Array.isArray(order.items)) {
      issues.push('Propriété "items" n\'est pas un tableau');
      suggestions.push('Convertir items en tableau d\'objets OrderItem');
    } else if (order.items.length === 0) {
      issues.push('Tableau "items" vide');
      suggestions.push('Ajouter au moins un article à la commande');
    }
    
    // Vérifier la cohérence du total
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      const calculatedTotal = order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      if (Math.abs(calculatedTotal - order.totalAmount) > 1) {
        issues.push(`Total incohérent: calculé=${calculatedTotal}, stocké=${order.totalAmount}`);
        suggestions.push('Recalculer le total à partir des articles');
      }
    } else if (order.totalAmount > 0) {
      issues.push('Total > 0 mais aucun article');
      suggestions.push('Soit ajouter des articles, soit corriger le total');
    }
    
    // Vérifier chaque item
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item, index) => {
        if (!item.productId) {
          issues.push(`Article ${index + 1}: productId manquant`);
        }
        if (!item.productName) {
          issues.push(`Article ${index + 1}: productName manquant`);
        }
        if (!item.quantity || item.quantity <= 0) {
          issues.push(`Article ${index + 1}: quantité invalide (${item.quantity})`);
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          issues.push(`Article ${index + 1}: prix unitaire invalide (${item.unitPrice})`);
        }
        if (!item.totalPrice || item.totalPrice <= 0) {
          issues.push(`Article ${index + 1}: prix total invalide (${item.totalPrice})`);
        }
        
        // Vérifier la cohérence prix unitaire * quantité = prix total
        const expectedTotal = (item.quantity || 0) * (item.unitPrice || 0);
        if (Math.abs(expectedTotal - (item.totalPrice || 0)) > 1) {
          issues.push(`Article ${index + 1}: calcul incorrect (${item.quantity} × ${item.unitPrice} ≠ ${item.totalPrice})`);
        }
      });
    }
    
    const debugInfo = {
      orderId: order.id,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      hasItems: !!order.items,
      itemsType: typeof order.items,
      isArray: Array.isArray(order.items),
      itemsLength: order.items ? order.items.length : 0,
      items: order.items,
      calculatedTotal: order.items && Array.isArray(order.items) 
        ? order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
        : 0
    };
    
    console.log('🔍 Analyse terminée:', {
      isValid: issues.length === 0,
      issuesCount: issues.length,
      issues,
      suggestions
    });
    console.groupEnd();
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      debugInfo
    };
  }
  
  static analyzeAllOrders(orders: Order[]): {
    totalOrders: number;
    validOrders: number;
    invalidOrders: number;
    commonIssues: string[];
    detailedReport: any[];
  } {
    console.group('🔍 ANALYSE GLOBALE DES COMMANDES');
    console.log(`📊 Analyse de ${orders.length} commandes...`);
    
    const reports = orders.map(order => ({
      order,
      analysis: this.analyzeOrder(order)
    }));
    
    const validOrders = reports.filter(r => r.analysis.isValid).length;
    const invalidOrders = reports.filter(r => !r.analysis.isValid).length;
    
    // Identifier les problèmes les plus fréquents
    const allIssues = reports.flatMap(r => r.analysis.issues);
    const issueFrequency = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commonIssues = Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => `${issue} (${count} fois)`);
    
    const summary = {
      totalOrders: orders.length,
      validOrders,
      invalidOrders,
      commonIssues,
      detailedReport: reports.map(r => ({
        orderId: r.order.id,
        customerName: r.order.customerName,
        totalAmount: r.order.totalAmount,
        isValid: r.analysis.isValid,
        issues: r.analysis.issues,
        debugInfo: r.analysis.debugInfo
      }))
    };
    
    console.log('📈 Résumé de l\'analyse:', summary);
    console.groupEnd();
    
    return summary;
  }
  
  static fixOrder(order: Order): Order {
    console.log('🔧 Tentative de correction de la commande:', order.id);
    
    const analysis = this.analyzeOrder(order);
    if (analysis.isValid) {
      console.log('✅ Commande déjà valide, aucune correction nécessaire');
      return order;
    }
    
    const fixedOrder = { ...order };
    
    // Corriger les items manquants
    if (!fixedOrder.items || !Array.isArray(fixedOrder.items) || fixedOrder.items.length === 0) {
      if (fixedOrder.totalAmount > 0) {
        console.log('🔧 Reconstruction des articles à partir du total');
        fixedOrder.items = [{
          productId: 'reconstructed',
          productName: 'Article reconstruit',
          quantity: 1,
          unitPrice: fixedOrder.totalAmount,
          totalPrice: fixedOrder.totalAmount
        }];
      } else {
        fixedOrder.items = [];
      }
    }
    
    // Corriger les items invalides
    fixedOrder.items = fixedOrder.items.map((item, index) => ({
      productId: item.productId || `unknown-${index}`,
      productName: item.productName || `Article ${index + 1}`,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || (item.quantity || 1) * (item.unitPrice || 0)
    }));
    
    // Recalculer le total si nécessaire
    const calculatedTotal = fixedOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (Math.abs(calculatedTotal - fixedOrder.totalAmount) > 1) {
      console.log('🔧 Correction du total:', {
        ancien: fixedOrder.totalAmount,
        nouveau: calculatedTotal
      });
      fixedOrder.totalAmount = calculatedTotal;
    }
    
    console.log('✅ Commande corrigée:', {
      orderId: fixedOrder.id,
      itemsCount: fixedOrder.items.length,
      totalAmount: fixedOrder.totalAmount
    });
    
    return fixedOrder;
  }
}

// Fonction utilitaire pour déboguer une commande spécifique
export const debugOrder = (order: Order) => {
  return OrderItemsDebugger.analyzeOrder(order);
};

// Fonction utilitaire pour déboguer toutes les commandes
export const debugAllOrders = (orders: Order[]) => {
  return OrderItemsDebugger.analyzeAllOrders(orders);
};

// Fonction utilitaire pour corriger une commande
export const fixOrder = (order: Order) => {
  return OrderItemsDebugger.fixOrder(order);
};