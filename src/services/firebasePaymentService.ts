import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Payment {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: 'bronze' | 'silver';
  amount: number;
  paymentMethod: 'mvola' | 'orange' | 'airtel';
  reference: string;
  receiptUrl?: string;
  status: 'pending' | 'validated' | 'rejected';
  validatedBy?: string;
  validatedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebasePaymentService {
  private static PAYMENTS_COLLECTION = 'payments';
  private static USERS_COLLECTION = 'users';

  static async createPayment(data: {
    userId: string;
    userEmail: string;
    userName: string;
    plan: 'bronze' | 'silver';
    amount: number;
    paymentMethod: 'mvola' | 'orange' | 'airtel';
    reference: string;
    receiptUrl?: string;
  }): Promise<Payment> {
    try {
      const paymentData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        plan: data.plan,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        receiptUrl: data.receiptUrl || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.PAYMENTS_COLLECTION), paymentData);

      return {
        id: docRef.id,
        ...paymentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as Payment;
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      throw error;
    }
  }

  static async getPendingPayments(): Promise<Payment[]> {
    try {
      console.log('Récupération des paiements en attente...');
      const q = query(
        collection(db, this.PAYMENTS_COLLECTION),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        } as Payment);
      });

      console.log(`${payments.length} paiement(s) en attente trouvé(s)`);
      return payments;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des paiements en attente:', error);
      if (error.code === 'failed-precondition') {
        console.error('Index Firestore manquant. Créez un index composite pour la collection "payments" avec les champs: status (Ascending), createdAt (Descending)');
      }
      throw error;
    }
  }

  static async getAllPayments(): Promise<Payment[]> {
    try {
      console.log('Récupération de tous les paiements...');

      const paymentsRef = collection(db, this.PAYMENTS_COLLECTION);
      const querySnapshot = await getDocs(paymentsRef);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        payments.push({
          id: doc.id,
          ...data
        } as Payment);
      });

      payments.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      console.log(`${payments.length} paiement(s) trouvé(s)`);
      payments.forEach(p => {
        console.log(`- ${p.userName} (${p.userEmail}): ${p.status} - ${p.amount} MGA`);
      });

      return payments;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de tous les paiements:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message:', error.message);
      throw error;
    }
  }

  static async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.PAYMENTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        } as Payment);
      });

      return payments;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements utilisateur:', error);
      throw error;
    }
  }

  static async validatePayment(data: {
    paymentId: string;
    validatedBy: string;
    status: 'validated' | 'rejected';
    rejectionReason?: string;
  }): Promise<void> {
    try {
      const paymentRef = doc(db, this.PAYMENTS_COLLECTION, data.paymentId);

      const updateData: any = {
        status: data.status,
        validatedBy: data.validatedBy,
        validatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (data.status === 'rejected' && data.rejectionReason) {
        updateData.rejectionReason = data.rejectionReason;
      }

      await updateDoc(paymentRef, updateData);

      if (data.status === 'validated') {
        const paymentDoc = await getDocs(
          query(collection(db, this.PAYMENTS_COLLECTION), where('__name__', '==', data.paymentId))
        );

        if (!paymentDoc.empty) {
          const payment = paymentDoc.docs[0].data() as Payment;
          await this.updateUserPlan(payment.userId, payment.plan);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la validation du paiement:', error);
      throw error;
    }
  }

  static async updateUserPlan(userId: string, plan: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);

      const planDuration = 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + planDuration);

      await updateDoc(userRef, {
        plan: plan,
        planStatus: 'active',
        planExpiry: Timestamp.fromDate(expiryDate),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du plan utilisateur:', error);
      throw error;
    }
  }

  static formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      mvola: 'MVola',
      orange: 'Orange Money',
      airtel: 'Airtel Money'
    };
    return methods[method] || method;
  }

  static formatDate(timestamp: Timestamp): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
