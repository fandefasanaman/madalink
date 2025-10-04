import { useEffect, useRef } from 'react';
import { Order } from '../utils/types';
import { VendorInfo } from '../components/VendorSettings';
import { emailService } from '../services/emailService';

interface UseAutoEmailReceiptsProps {
  orders: Order[];
  vendorInfo: VendorInfo;
  enabled: boolean;
}

export const useAutoEmailReceipts = ({ orders, vendorInfo, enabled }: UseAutoEmailReceiptsProps) => {
  const previousOrdersRef = useRef<Order[]>([]);
  const sentReceiptsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      console.log('📧 Auto email receipts disabled');
      return;
    }

    console.log('🔄 Checking for order changes...', {
      currentOrdersCount: orders.length,
      previousOrdersCount: previousOrdersRef.current.length,
      enabled,
      timestamp: new Date().toISOString()
    });

    const previousOrders = previousOrdersRef.current;
    const currentOrders = orders;

    // Détecter les nouvelles validations de commandes
    currentOrders.forEach(currentOrder => {
      const previousOrder = previousOrders.find(o => o.id === currentOrder.id);
      
      console.log(`🔍 Analyzing order ${currentOrder.id}:`, {
        previousStatus: previousOrder?.status || 'new',
        currentStatus: currentOrder.status,
        previousPayment: previousOrder?.paymentStatus || 'new',
        currentPayment: currentOrder.paymentStatus,
        alreadySentConfirmed: sentReceiptsRef.current.has(`${currentOrder.id}-confirmed`),
        alreadySentPayment: sentReceiptsRef.current.has(`${currentOrder.id}-payment`)
      });
      
      // Nouvelle commande confirmée
      if ((!previousOrder || previousOrder.status === 'pending') && 
          currentOrder.status === 'confirmed' &&
          !sentReceiptsRef.current.has(`${currentOrder.id}-confirmed`)) {
        
        console.log('🔔 Nouvelle commande confirmée détectée:', {
          orderId: currentOrder.id,
          customerName: currentOrder.customerName,
          totalAmount: currentOrder.totalAmount,
          vendorEmail: vendorInfo.email
        });
        
        emailService.sendReceiptEmail(currentOrder, vendorInfo, 'order_confirmed')
          .then(success => {
            if (success) {
              sentReceiptsRef.current.add(`${currentOrder.id}-confirmed`);
              console.log('✅ Email de confirmation de commande envoyé avec succès:', {
                orderId: currentOrder.id,
                customerName: currentOrder.customerName,
                timestamp: new Date().toISOString()
              });
            } else {
              console.error('❌ Échec envoi email confirmation commande:', {
                orderId: currentOrder.id,
                customerName: currentOrder.customerName
              });
            }
          })
          .catch(error => {
            console.error('💥 Exception lors de l\'envoi email confirmation commande:', {
              orderId: currentOrder.id,
              error: error.message,
              stack: error.stack
            });
          });
      }

      // Paiement confirmé
      if ((!previousOrder || previousOrder.paymentStatus !== 'paid') && 
          currentOrder.paymentStatus === 'paid' &&
          !sentReceiptsRef.current.has(`${currentOrder.id}-payment`)) {
        
        console.log('💰 Nouveau paiement confirmé détecté:', {
          orderId: currentOrder.id,
          customerName: currentOrder.customerName,
          totalAmount: currentOrder.totalAmount,
          paymentMethod: currentOrder.paymentMethod
        });
        
        emailService.sendReceiptEmail(currentOrder, vendorInfo, 'payment_received')
          .then(success => {
            if (success) {
              sentReceiptsRef.current.add(`${currentOrder.id}-payment`);
              console.log('✅ Email de confirmation de paiement envoyé avec succès:', {
                orderId: currentOrder.id,
                customerName: currentOrder.customerName,
                timestamp: new Date().toISOString()
              });
            } else {
              console.error('❌ Échec envoi email confirmation paiement:', {
                orderId: currentOrder.id,
                customerName: currentOrder.customerName
              });
            }
          })
          .catch(error => {
            console.error('💥 Exception lors de l\'envoi email confirmation paiement:', {
              orderId: currentOrder.id,
              error: error.message,
              stack: error.stack
            });
          });
      }
    });

    // Mettre à jour la référence
    previousOrdersRef.current = [...currentOrders];
    
    console.log('📝 Updated previous orders reference:', {
      count: currentOrders.length,
      sentReceiptsCount: sentReceiptsRef.current.size
    });
  }, [orders, vendorInfo, enabled]);

  // Nettoyer les références lors du démontage
  useEffect(() => {
    return () => {
      sentReceiptsRef.current.clear();
    };
  }, []);

  return {
    // Méthodes utilitaires pour l'interface
    getSentReceiptsCount: () => sentReceiptsRef.current.size,
    hasSentReceipt: (orderId: string, type: 'confirmed' | 'payment') => 
      sentReceiptsRef.current.has(`${orderId}-${type}`),
    
    // Méthode pour envoyer manuellement un reçu
    sendManualReceipt: async (order: Order, type: 'order_confirmed' | 'payment_received') => {
      console.log('📤 Manual receipt send requested:', {
        orderId: order.id,
        type,
        customerName: order.customerName,
        vendorEmail: vendorInfo.email
      });
      
      try {
        const success = await emailService.sendReceiptEmail(order, vendorInfo, type);
        if (success) {
          const key = type === 'order_confirmed' ? 'confirmed' : 'payment';
          sentReceiptsRef.current.add(`${order.id}-${key}`);
          console.log('✅ Manual receipt sent successfully:', {
            orderId: order.id,
            type,
            key
          });
        } else {
          console.error('❌ Manual receipt send failed:', {
            orderId: order.id,
            type
          });
        }
        return success;
      } catch (error) {
        console.error('💥 Exception during manual receipt send:', {
          orderId: order.id,
          type,
          error: error instanceof Error ? error.message : error
        });
        return false;
      }
    }
  };
};