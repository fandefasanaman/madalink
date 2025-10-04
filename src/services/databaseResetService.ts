import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ResetProgress {
  collection: string;
  deleted: number;
  total: number;
  completed: boolean;
}

export interface ResetResult {
  success: boolean;
  totalDeleted: number;
  collections: ResetProgress[];
  duration: number;
  error?: string;
}

export class DatabaseResetService {
  private static readonly COLLECTIONS = [
    'contacts',
    'products', 
    'orders',
    'notes',
    'reminders',
    'vendorInfo'
  ];

  // Supprimer tous les documents d'une collection pour un utilisateur
  static async deleteUserCollection(
    collectionName: string, 
    userId: string,
    onProgress?: (progress: ResetProgress) => void
  ): Promise<ResetProgress> {
    console.log(`🗑️ Starting deletion of collection: ${collectionName} for user: ${userId}`);
    
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const total = snapshot.docs.length;
    let deleted = 0;
    
    console.log(`📊 Found ${total} documents in ${collectionName}`);
    
    if (total === 0) {
      const progress: ResetProgress = {
        collection: collectionName,
        deleted: 0,
        total: 0,
        completed: true
      };
      onProgress?.(progress);
      return progress;
    }

    // Utiliser des batches pour optimiser les suppressions
    const batchSize = 500; // Limite Firestore
    const batches: any[] = [];
    
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = snapshot.docs.slice(i, i + batchSize);
      
      batchDocs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
      
      batches.push(batch);
    }

    // Exécuter tous les batches
    for (const batch of batches) {
      await batch.commit();
      deleted += Math.min(batchSize, total - deleted);
      
      const progress: ResetProgress = {
        collection: collectionName,
        deleted,
        total,
        completed: deleted >= total
      };
      
      onProgress?.(progress);
      console.log(`🔄 Progress ${collectionName}: ${deleted}/${total}`);
    }

    const finalProgress: ResetProgress = {
      collection: collectionName,
      deleted,
      total,
      completed: true
    };

    console.log(`✅ Completed deletion of ${collectionName}: ${deleted} documents deleted`);
    return finalProgress;
  }

  // Reset complet pour un utilisateur spécifique
  static async resetUserData(
    userId: string,
    onProgress?: (progress: ResetProgress) => void
  ): Promise<ResetResult> {
    const startTime = Date.now();
    console.log(`🚀 Starting complete database reset for user: ${userId}`);
    
    try {
      const results: ResetProgress[] = [];
      let totalDeleted = 0;

      // Supprimer chaque collection
      for (const collectionName of this.COLLECTIONS) {
        try {
          const progress = await this.deleteUserCollection(collectionName, userId, onProgress);
          results.push(progress);
          totalDeleted += progress.deleted;
          
          console.log(`✅ Collection ${collectionName} reset completed: ${progress.deleted} documents deleted`);
        } catch (error) {
          console.error(`❌ Error resetting collection ${collectionName}:`, error);
          const errorProgress: ResetProgress = {
            collection: collectionName,
            deleted: 0,
            total: 0,
            completed: false
          };
          results.push(errorProgress);
        }
      }

      const duration = Date.now() - startTime;
      
      const result: ResetResult = {
        success: true,
        totalDeleted,
        collections: results,
        duration
      };

      console.log(`🎉 Database reset completed successfully in ${duration}ms:`, {
        totalDeleted,
        collectionsProcessed: results.length,
        userId
      });

      // Logger l'opération
      this.logResetOperation(userId, result);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      console.error(`💥 Database reset failed after ${duration}ms:`, error);
      
      const result: ResetResult = {
        success: false,
        totalDeleted: 0,
        collections: [],
        duration,
        error: errorMessage
      };

      this.logResetOperation(userId, result);
      return result;
    }
  }

  // Reset complet de toute la base (DANGER - Admin seulement)
  static async resetEntireDatabase(
    adminConfirmation: string,
    onProgress?: (progress: ResetProgress) => void
  ): Promise<ResetResult> {
    if (adminConfirmation !== 'RESET_ENTIRE_DATABASE_CONFIRMED') {
      throw new Error('Confirmation admin requise pour le reset complet');
    }

    const startTime = Date.now();
    console.warn('⚠️ DANGER: Starting complete database reset for ALL USERS');
    
    try {
      const results: ResetProgress[] = [];
      let totalDeleted = 0;

      // Supprimer chaque collection entièrement
      for (const collectionName of this.COLLECTIONS) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);
          
          const total = snapshot.docs.length;
          let deleted = 0;
          
          console.log(`📊 Found ${total} documents in ${collectionName} (ALL USERS)`);
          
          if (total > 0) {
            // Utiliser des batches
            const batchSize = 500;
            const batches: any[] = [];
            
            for (let i = 0; i < snapshot.docs.length; i += batchSize) {
              const batch = writeBatch(db);
              const batchDocs = snapshot.docs.slice(i, i + batchSize);
              
              batchDocs.forEach(docSnapshot => {
                batch.delete(docSnapshot.ref);
              });
              
              batches.push(batch);
            }

            // Exécuter tous les batches
            for (const batch of batches) {
              await batch.commit();
              deleted += Math.min(batchSize, total - deleted);
              
              const progress: ResetProgress = {
                collection: collectionName,
                deleted,
                total,
                completed: deleted >= total
              };
              
              onProgress?.(progress);
            }
          }

          const finalProgress: ResetProgress = {
            collection: collectionName,
            deleted,
            total,
            completed: true
          };

          results.push(finalProgress);
          totalDeleted += deleted;
          
          console.log(`✅ Collection ${collectionName} completely reset: ${deleted} documents deleted`);
        } catch (error) {
          console.error(`❌ Error resetting collection ${collectionName}:`, error);
          const errorProgress: ResetProgress = {
            collection: collectionName,
            deleted: 0,
            total: 0,
            completed: false
          };
          results.push(errorProgress);
        }
      }

      const duration = Date.now() - startTime;
      
      const result: ResetResult = {
        success: true,
        totalDeleted,
        collections: results,
        duration
      };

      console.warn(`⚠️ ENTIRE DATABASE RESET COMPLETED in ${duration}ms:`, {
        totalDeleted,
        collectionsProcessed: results.length
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      console.error(`💥 Entire database reset failed after ${duration}ms:`, error);
      
      return {
        success: false,
        totalDeleted: 0,
        collections: [],
        duration,
        error: errorMessage
      };
    }
  }

  // Logger les opérations de reset
  private static logResetOperation(userId: string, result: ResetResult) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: 'DATABASE_RESET',
      userId,
      success: result.success,
      totalDeleted: result.totalDeleted,
      duration: result.duration,
      collections: result.collections.map(c => ({
        name: c.collection,
        deleted: c.deleted,
        total: c.total
      })),
      error: result.error
    };

    // Sauvegarder dans localStorage pour audit
    const resetLogs = JSON.parse(localStorage.getItem('database-reset-logs') || '[]');
    resetLogs.unshift(logEntry);
    
    // Garder seulement les 50 derniers logs
    if (resetLogs.length > 50) {
      resetLogs.splice(50);
    }
    
    localStorage.setItem('database-reset-logs', JSON.stringify(resetLogs));
    
    console.group('📝 DATABASE RESET LOG');
    console.log('⏰ Timestamp:', logEntry.timestamp);
    console.log('👤 User ID:', userId);
    console.log('✅ Success:', result.success);
    console.log('🗑️ Total Deleted:', result.totalDeleted);
    console.log('⚡ Duration:', result.duration + 'ms');
    console.log('📊 Collections:', logEntry.collections);
    if (result.error) console.error('❌ Error:', result.error);
    console.groupEnd();
  }

  // Obtenir les logs de reset
  static getResetLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('database-reset-logs') || '[]');
    } catch (error) {
      console.error('Erreur lecture logs reset:', error);
      return [];
    }
  }

  // Nettoyer les logs de reset
  static clearResetLogs(): void {
    localStorage.removeItem('database-reset-logs');
  }

  // Vérifier si l'utilisateur peut effectuer un reset
  static canUserReset(userId: string): boolean {
    // Pour la sécurité, on peut ajouter des vérifications ici
    // Par exemple, vérifier les permissions, le rôle, etc.
    return !!userId;
  }

  // Estimer le temps de reset
  static async estimateResetTime(userId: string): Promise<{
    estimatedDuration: number;
    totalDocuments: number;
    collections: { name: string; count: number }[];
  }> {
    console.log('📊 Estimating reset time for user:', userId);
    
    const collections: { name: string; count: number }[] = [];
    let totalDocuments = 0;

    for (const collectionName of this.COLLECTIONS) {
      try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        const count = snapshot.docs.length;
        collections.push({ name: collectionName, count });
        totalDocuments += count;
        
        console.log(`📋 ${collectionName}: ${count} documents`);
      } catch (error) {
        console.error(`❌ Error counting ${collectionName}:`, error);
        collections.push({ name: collectionName, count: 0 });
      }
    }

    // Estimation: ~10ms par document + overhead
    const estimatedDuration = Math.max(totalDocuments * 10, 1000);

    console.log('⏱️ Reset estimation:', {
      totalDocuments,
      estimatedDuration: estimatedDuration + 'ms',
      collections
    });

    return {
      estimatedDuration,
      totalDocuments,
      collections
    };
  }
}

// Fonction utilitaire pour le reset utilisateur
export const resetUserDatabase = (userId: string, onProgress?: (progress: ResetProgress) => void) => {
  return DatabaseResetService.resetUserData(userId, onProgress);
};

// Fonction utilitaire pour l'estimation
export const estimateResetTime = (userId: string) => {
  return DatabaseResetService.estimateResetTime(userId);
};

// Fonction utilitaire pour les logs
export const getResetLogs = () => {
  return DatabaseResetService.getResetLogs();
};