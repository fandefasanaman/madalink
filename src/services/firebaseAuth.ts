import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'bronze' | 'silver' | 'gold';
  credits: number;
  isAdmin: boolean;
  createdAt: string;
  expiresAt?: string;
  alldebridApiKey?: string;
  downloadStats: {
    totalDownloads: number;
    totalSize: number;
    thisMonth: number;
    thisWeek: number;
  };
  preferences: {
    language: 'fr' | 'mg';
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

export class FirebaseAuthService {
  // Inscription utilisateur
  static async register(email: string, password: string, name: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mettre à jour le profil Firebase
      await updateProfile(user, { displayName: name });

      // Créer le profil utilisateur dans Firestore
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email!,
        name,
        plan: 'free',
        credits: 2,
        isAdmin: email === 'admin@madalink.mg' || email === '1nirinanirina2@gmail.com',
        createdAt: new Date().toISOString(),
        downloadStats: {
          totalDownloads: 0,
          totalSize: 0,
          thisMonth: 0,
          thisWeek: 0
        },
        preferences: {
          language: 'fr',
          theme: 'light',
          notifications: true
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Connexion utilisateur
  static async login(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupérer le profil utilisateur
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      // Si le profil n'existe pas, le créer automatiquement
      if (!userDoc.exists()) {
        console.log('Profil Firestore manquant, création automatique...');
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email!,
          name: user.displayName || user.email!.split('@')[0],
          plan: 'free',
          credits: 2,
          isAdmin: user.email === 'admin@madalink.mg' || user.email === '1nirinanirina2@gmail.com',
          createdAt: new Date().toISOString(),
          downloadStats: {
            totalDownloads: 0,
            totalSize: 0,
            thisMonth: 0,
            thisWeek: 0
          },
          preferences: {
            language: 'fr',
            theme: 'light',
            notifications: true
          }
        };

        await setDoc(doc(db, 'users', user.uid), newProfile);
        return newProfile;
      }

      return userDoc.data() as UserProfile;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  // Récupérer le profil utilisateur
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Vérifier que l'utilisateur est bien authentifié
      if (!auth.currentUser || auth.currentUser.uid !== userId) {
        console.warn('Utilisateur non authentifié ou ID utilisateur incorrect');
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() as UserProfile : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      // Si c'est une erreur de permissions, on retourne null plutôt que de faire planter l'app
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.warn('Permissions insuffisantes pour récupérer le profil utilisateur');
        return null;
      }
      return null;
    }
  }

  // Promouvoir un utilisateur en admin (fonction utilitaire)
  static async promoteToAdmin(email: string): Promise<void> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Utilisateur non trouvé');
      }

      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        isAdmin: true
      });

      console.log(`Utilisateur ${email} promu en administrateur`);
    } catch (error) {
      console.error('Erreur lors de la promotion:', error);
      throw error;
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  // Mettre à jour les statistiques de téléchargement
  static async updateDownloadStats(userId: string, downloadSize: number): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const updatedStats = {
          ...userData.downloadStats,
          totalDownloads: userData.downloadStats.totalDownloads + 1,
          totalSize: userData.downloadStats.totalSize + downloadSize,
          thisMonth: userData.downloadStats.thisMonth + 1,
          thisWeek: userData.downloadStats.thisWeek + 1
        };

        await updateDoc(doc(db, 'users', userId), {
          downloadStats: updatedStats
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
  }

  // Sauvegarder la clé API Alldebrid
  static async saveAlldebridApiKey(userId: string, apiKey: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        alldebridApiKey: apiKey
      });
    } catch (error) {
      throw new Error('Erreur lors de la sauvegarde de la clé API');
    }
  }

  // Observer les changements d'authentification
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Messages d'erreur traduits
  private static getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
      'auth/network-request-failed': 'Erreur de connexion réseau'
    };

    return errorMessages[errorCode] || 'Une erreur est survenue';
  }
}