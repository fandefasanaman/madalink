import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  runTransaction, 
  query, 
  orderBy, 
  limit,
  where,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ReceiptNumberResult {
  receiptNumber: string;
  sequenceNumber: number;
  year: number;
}

export class FirebaseReceiptNumberingService {
  private static readonly PREFIX = 'REC';
  private static readonly ORDERS_COLLECTION = 'orders';
  private static readonly COUNTER_COLLECTION = 'settings';
  private static readonly COUNTER_DOC = 'receiptCounter';

  // Générer le prochain numéro de reçu séquentiel avec Firebase
  static async getNextReceiptNumber(userId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    try {
      console.log('🔢 Generating sequential receipt number for user:', userId);
      
      // Utiliser un compteur global avec transaction pour éviter les doublons
      const receiptNumber = await this.getNextSequentialNumber(userId, currentYear);
      
      console.log('✅ Generated sequential receipt number:', receiptNumber);
      return receiptNumber;
      
    } catch (error) {
      console.error('❌ Error generating sequential receipt number:', error);
      
      // Fallback : utiliser la méthode de scan pour éviter les erreurs
      return this.getFallbackReceiptNumber(userId, currentYear);
    }
  }

  // Méthode principale : utiliser un compteur global avec transaction
  private static async getNextSequentialNumber(userId: string, year: number): Promise<string> {
    const counterRef = doc(db, this.COUNTER_COLLECTION, `${this.COUNTER_DOC}_${userId}_${year}`);
    
    try {
      const result = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        let currentNumber = 1;
        if (counterDoc.exists()) {
          currentNumber = (counterDoc.data().lastNumber || 0) + 1;
        }
        
        // Mettre à jour le compteur
        transaction.set(counterRef, { 
          lastNumber: currentNumber,
          lastUpdated: new Date(),
          userId: userId,
          year: year
        });
        
        return currentNumber;
      });
      
      const paddedNumber = result.toString().padStart(3, '0');
      return `${this.PREFIX} ${paddedNumber}-${year}`;
      
    } catch (error) {
      console.error('❌ Transaction failed, using fallback method:', error);
      return this.getFallbackReceiptNumber(userId, year);
    }
  }

  // Méthode de fallback : scanner les commandes existantes
  private static async getFallbackReceiptNumber(userId: string, year: number): Promise<string> {
    try {
      console.log('🔄 Using fallback method to generate receipt number');
      
      const ordersRef = collection(db, this.ORDERS_COLLECTION);
      const q = query(
        ordersRef,
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      let highestNumber = 0;
      
      snapshot.docs.forEach(doc => {
        const order = doc.data();
        if (order.receiptNumber) {
          // Extraire le numéro de "REC 001-2025"
          const match = order.receiptNumber.match(/REC (\d+)-(\d+)/);
          if (match) {
            const number = parseInt(match[1]);
            const receiptYear = parseInt(match[2]);
            
            // Seulement considérer les reçus de la même année
            if (receiptYear === year && number > highestNumber) {
              highestNumber = number;
            }
          }
        }
      });
      
      const nextNumber = highestNumber + 1;
      const paddedNumber = nextNumber.toString().padStart(3, '0');
      
      console.log('📊 Fallback method - next number:', nextNumber);
      return `${this.PREFIX} ${paddedNumber}-${year}`;
      
    } catch (error) {
      console.error('❌ Fallback method failed:', error);
      // Dernier recours : utiliser 001
      return `${this.PREFIX} 001-${year}`;
    }
  }

  // Corriger tous les numéros de reçu existants pour qu'ils soient séquentiels
  static async fixAllReceiptNumbers(userId: string): Promise<{
    success: boolean;
    fixed: number;
    errors: string[];
  }> {
    console.log('🔧 Starting complete receipt number fix for user:', userId);
    
    try {
      // Récupérer toutes les commandes de l'utilisateur triées par date de création
      const ordersRef = collection(db, this.ORDERS_COLLECTION);
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'asc') // Trier par date de création pour maintenir l'ordre chronologique
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data()
      }));
      
      console.log('📋 Found', orders.length, 'orders to renumber');
      
      // Grouper par année
      const ordersByYear = orders.reduce((acc, order) => {
        const orderDate = order.orderDate?.toDate ? order.orderDate.toDate() : new Date(order.orderDate);
        const year = orderDate.getFullYear();
        if (!acc[year]) acc[year] = [];
        acc[year].push(order);
        return acc;
      }, {} as Record<number, any[]>);
      
      let fixedCount = 0;
      const errors: string[] = [];
      
      // Corriger chaque année séparément
      for (const [year, yearOrders] of Object.entries(ordersByYear)) {
        console.log(`📅 Processing year ${year} with ${yearOrders.length} orders`);
        
        // Réassigner les numéros séquentiellement
        for (let i = 0; i < yearOrders.length; i++) {
          const order = yearOrders[i];
          const newSequenceNumber = i + 1;
          const paddedNumber = newSequenceNumber.toString().padStart(3, '0');
          const newReceiptNumber = `${this.PREFIX} ${paddedNumber}-${year}`;
          
          try {
            // Mettre à jour le numéro de reçu
            await updateDoc(order.ref, {
              receiptNumber: newReceiptNumber
            });
            
            console.log(`✅ Updated order ${order.id}: ${order.receiptNumber || 'undefined'} → ${newReceiptNumber}`);
            fixedCount++;
          } catch (error) {
            const errorMsg = `Failed to update order ${order.id}: ${error}`;
            console.error('❌', errorMsg);
            errors.push(errorMsg);
          }
        }
        
        // Mettre à jour le compteur pour cette année
        try {
          const counterRef = doc(db, this.COUNTER_COLLECTION, `${this.COUNTER_DOC}_${userId}_${year}`);
          await setDoc(counterRef, {
            lastNumber: yearOrders.length,
            lastUpdated: new Date(),
            userId: userId,
            year: parseInt(year)
          });
          console.log(`📊 Updated counter for year ${year}: ${yearOrders.length}`);
        } catch (error) {
          console.error(`❌ Failed to update counter for year ${year}:`, error);
        }
      }
      
      console.log('🎉 Receipt number fix completed:', {
        totalOrders: orders.length,
        fixedCount,
        errorsCount: errors.length
      });
      
      return {
        success: errors.length === 0,
        fixed: fixedCount,
        errors
      };
      
    } catch (error) {
      console.error('💥 Critical error during receipt number fix:', error);
      return {
        success: false,
        fixed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Corriger les doublons existants pour un utilisateur (méthode existante améliorée)
  static async fixDuplicateReceipts(userId: string): Promise<{
    success: boolean;
    fixed: number;
    errors: string[];
  }> {
    console.log('🔧 Starting duplicate receipt fix (will make sequential) for user:', userId);
    
    // Utiliser la fonction de correction complète qui rend tout séquentiel
    return this.fixAllReceiptNumbers(userId);
  }

  // Vérifier s'il y a des doublons ou des numéros non-séquentiels
  static async checkForDuplicates(userId: string): Promise<{
    hasDuplicates: boolean;
    hasNonSequential: boolean;
    duplicates: { receiptNumber: string; count: number; orderIds: string[] }[];
    nonSequentialNumbers: string[];
    totalOrders: number;
    expectedSequence: string[];
  }> {
    try {
      console.log('🔍 Checking for duplicates and non-sequential numbers for user:', userId);
      
      const ordersRef = collection(db, this.ORDERS_COLLECTION);
      const q = query(ordersRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const receiptCounts = new Map<string, string[]>();
      const allNumbers: number[] = [];
      const currentYear = new Date().getFullYear();
      
      snapshot.docs.forEach(doc => {
        const order = doc.data();
        if (order.receiptNumber) {
          // Compter les doublons
          const existing = receiptCounts.get(order.receiptNumber) || [];
          existing.push(doc.id);
          receiptCounts.set(order.receiptNumber, existing);
          
          // Extraire les numéros pour vérifier la séquence
          const match = order.receiptNumber.match(/REC (\d+)-(\d+)/);
          if (match) {
            const number = parseInt(match[1]);
            const year = parseInt(match[2]);
            if (year === currentYear) {
              allNumbers.push(number);
            }
          }
        }
      });
      
      // Identifier les doublons
      const duplicates = Array.from(receiptCounts.entries())
        .filter(([_, orderIds]) => orderIds.length > 1)
        .map(([receiptNumber, orderIds]) => ({
          receiptNumber,
          count: orderIds.length,
          orderIds
        }));
      
      // Vérifier la séquence
      allNumbers.sort((a, b) => a - b);
      const expectedSequence: string[] = [];
      const nonSequentialNumbers: string[] = [];
      
      for (let i = 1; i <= snapshot.docs.length; i++) {
        const paddedNumber = i.toString().padStart(3, '0');
        expectedSequence.push(`REC ${paddedNumber}-${currentYear}`);
        
        if (!allNumbers.includes(i)) {
          nonSequentialNumbers.push(`REC ${paddedNumber}-${currentYear}`);
        }
      }
      
      // Identifier les numéros qui ne suivent pas la séquence attendue
      const hasNonSequential = allNumbers.some((num, index) => num !== index + 1) || 
                              allNumbers.length !== snapshot.docs.length;
      
      const result = {
        hasDuplicates: duplicates.length > 0,
        hasNonSequential,
        duplicates,
        nonSequentialNumbers,
        totalOrders: snapshot.docs.length,
        expectedSequence: expectedSequence.slice(0, 10) // Montrer seulement les 10 premiers
      };
      
      console.log('📊 Duplicate and sequence check result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error checking duplicates and sequence:', error);
      return {
        hasDuplicates: false,
        hasNonSequential: false,
        duplicates: [],
        nonSequentialNumbers: [],
        totalOrders: 0,
        expectedSequence: []
      };
    }
  }

  // Réinitialiser complètement la numérotation (admin seulement)
  static async resetNumberingSystem(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Resetting complete numbering system for user:', userId);
      
      // Supprimer tous les compteurs existants pour cet utilisateur
      const currentYear = new Date().getFullYear();
      const counterRef = doc(db, this.COUNTER_COLLECTION, `${this.COUNTER_DOC}_${userId}_${currentYear}`);
      
      await setDoc(counterRef, {
        lastNumber: 0,
        lastUpdated: new Date(),
        userId: userId,
        year: currentYear
      });
      
      // Corriger tous les numéros existants
      const fixResult = await this.fixAllReceiptNumbers(userId);
      
      if (fixResult.success) {
        return {
          success: true,
          message: `Système de numérotation réinitialisé. ${fixResult.fixed} commandes renumérées.`
        };
      } else {
        return {
          success: false,
          message: `Réinitialisation partielle. ${fixResult.fixed} commandes renumérées, ${fixResult.errors.length} erreurs.`
        };
      }
      
    } catch (error) {
      console.error('❌ Error resetting numbering system:', error);
      return {
        success: false,
        message: `Erreur lors de la réinitialisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }
}

// Fonction utilitaire pour l'interface
export const generateReceiptNumber = (userId: string) => {
  return FirebaseReceiptNumberingService.getNextReceiptNumber(userId);
};

export const fixDuplicateReceipts = (userId: string) => {
  return FirebaseReceiptNumberingService.fixAllReceiptNumbers(userId);
};

export const checkForDuplicates = (userId: string) => {
  return FirebaseReceiptNumberingService.checkForDuplicates(userId);
};

export const resetNumberingSystem = (userId: string) => {
  return FirebaseReceiptNumberingService.resetNumberingSystem(userId);
};