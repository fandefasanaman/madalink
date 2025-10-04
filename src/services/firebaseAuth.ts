import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
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
  plan: 'free' | 'bronze' | 'silver' | 'gold';
  isAdmin: boolean;
  subscriptionExpiry?: Date;
  totalDownloads?: number;
  totalBandwidth?: number;
  createdAt: Date;
  updatedAt: Date;
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
    return {
      id: userDoc.id,
      email: data.email,
      name: data.name,
      plan: data.plan || 'free',
      isAdmin: data.isAdmin || false,
      subscriptionExpiry: data.subscriptionExpiry?.toDate(),
      totalDownloads: data.totalDownloads || 0,
      totalBandwidth: data.totalBandwidth || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
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
}
