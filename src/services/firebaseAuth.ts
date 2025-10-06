import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'trial' | 'bronze' | 'silver' | 'gold';
  isAdmin: boolean;
  subscriptionExpiry?: Date;
  totalDownloads?: number;
  totalBandwidth?: number;
  createdAt: Date;
  updatedAt: Date;
  passwordMustChange?: boolean;
  status?: 'active' | 'pending' | 'suspended';
}

const USERS_COLLECTION = 'users';

export class FirebaseAuthService {
  static async register(email: string, password: string, name: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile: Omit<UserProfile, 'id'> = {
      email: user.email!,
      name,
      plan: 'free',
      isAdmin: false,
      totalDownloads: 0,
      totalBandwidth: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      id: user.uid,
      ...userProfile
    };
  }

  static async login(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile = await this.getUserProfile(user.uid);
    return userProfile;
  }

  static async logout(): Promise<void> {
    await signOut(auth);
  }

  static async getUserProfile(userId: string): Promise<UserProfile> {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const data = userDoc.data();

    const convertToDate = (timestamp: any): Date => {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
      }
      return new Date();
    };

    return {
      id: userDoc.id,
      email: data.email,
      name: data.name,
      plan: data.plan || 'free',
      isAdmin: data.isAdmin || false,
      subscriptionExpiry: data.subscriptionExpiry ? convertToDate(data.subscriptionExpiry) : undefined,
      totalDownloads: data.totalDownloads || 0,
      totalBandwidth: data.totalBandwidth || 0,
      createdAt: convertToDate(data.createdAt),
      updatedAt: convertToDate(data.updatedAt)
    };
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { id, ...updateData } = updates;

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  }

  static async updateDownloadStats(userId: string, bandwidth: number): Promise<void> {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      totalDownloads: increment(1),
      totalBandwidth: increment(bandwidth),
      updatedAt: serverTimestamp()
    });
  }

  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  static async promoteToAdmin(userId: string): Promise<void> {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      isAdmin: true,
      updatedAt: serverTimestamp()
    });
  }

  static async createUserByAdmin(
    email: string,
    password: string,
    name: string,
    plan: UserProfile['plan'],
    status: 'active' | 'pending'
  ): Promise<UserProfile> {
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser?.email;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userProfile: Omit<UserProfile, 'id'> = {
        email: user.email!,
        name,
        plan,
        isAdmin: false,
        status,
        totalDownloads: 0,
        totalBandwidth: 0,
        passwordMustChange: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, USERS_COLLECTION, user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await signOut(auth);

      return {
        id: user.uid,
        ...userProfile
      };
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Utilisateur non connecté');
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');

    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(usersQuery);

    const convertToDate = (timestamp: any): Date => {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
      }
      return new Date();
    };

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        plan: data.plan || 'free',
        isAdmin: data.isAdmin || false,
        status: data.status || 'active',
        subscriptionExpiry: data.subscriptionExpiry ? convertToDate(data.subscriptionExpiry) : undefined,
        totalDownloads: data.totalDownloads || 0,
        totalBandwidth: data.totalBandwidth || 0,
        createdAt: convertToDate(data.createdAt),
        updatedAt: convertToDate(data.updatedAt),
        passwordMustChange: data.passwordMustChange
      };
    });
  }

  static async updateUserByAdmin(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { id, email, createdAt, ...updateData } = updates;

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteUser(userId: string): Promise<void> {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  }

  static async checkUserExists(email: string): Promise<boolean> {
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );

    const snapshot = await getDocs(usersQuery);
    return !snapshot.empty;
  }

  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );

    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const convertToDate = (timestamp: any): Date => {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
      }
      return new Date();
    };

    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      plan: data.plan || 'free',
      isAdmin: data.isAdmin || false,
      status: data.status || 'active',
      subscriptionExpiry: data.subscriptionExpiry ? convertToDate(data.subscriptionExpiry) : undefined,
      totalDownloads: data.totalDownloads || 0,
      totalBandwidth: data.totalBandwidth || 0,
      createdAt: convertToDate(data.createdAt),
      updatedAt: convertToDate(data.updatedAt),
      passwordMustChange: data.passwordMustChange
    };
  }
}
