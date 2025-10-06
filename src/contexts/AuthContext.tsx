import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { FirebaseAuthService, UserProfile } from '../services/firebaseAuth';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userProfile = await FirebaseAuthService.getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil utilisateur:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const userProfile = await FirebaseAuthService.login(email, password);
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setLoading(true);
    try {
      const userProfile = await FirebaseAuthService.register(email, password, name);
      setUser(userProfile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    FirebaseAuthService.logout();
    setUser(null);
    setFirebaseUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (user) {
      await FirebaseAuthService.updateUserProfile(user.id, updates);
      setUser({ ...user, ...updates });
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    throw new Error('Fonctionnalité de réinitialisation de mot de passe non implémentée');
  };

  const value = {
    user,
    firebaseUser,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};