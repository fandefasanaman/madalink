import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface AlldebridContextType {
  adminApiKey: string | null;
  loading: boolean;
  error: string | null;
  updateAdminApiKey: (apiKey: string) => Promise<void>;
  refreshApiKey: () => Promise<void>;
}

const AlldebridContext = createContext<AlldebridContextType | undefined>(undefined);

export const useAlldebridContext = () => {
  const context = useContext(AlldebridContext);
  if (context === undefined) {
    throw new Error('useAlldebridContext must be used within an AlldebridProvider');
  }
  return context;
};

interface AlldebridProviderProps {
  children: ReactNode;
}

export const AlldebridProvider: React.FC<AlldebridProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [adminApiKey, setAdminApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminApiKey = async () => {
    try {
      setLoading(true);
      setError(null);

      const settingsRef = doc(db, 'app_settings', 'alldebrid_api_key');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setAdminApiKey(data.setting_value || null);
      } else {
        setAdminApiKey(null);
      }
    } catch (err) {
      console.error('Exception fetching admin API key:', err);
      setError('Erreur lors de la récupération de la clé API');
      setAdminApiKey(null);
    } finally {
      setLoading(false);
    }
  };

  const updateAdminApiKey = async (apiKey: string): Promise<void> => {
    if (!user?.isAdmin) {
      throw new Error('Seuls les administrateurs peuvent modifier la clé API');
    }

    try {
      const settingsRef = doc(db, 'app_settings', 'alldebrid_api_key');
      await setDoc(settingsRef, {
        setting_value: apiKey,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }, { merge: true });

      setAdminApiKey(apiKey);
    } catch (err: any) {
      console.error('Error updating admin API key:', err);
      throw new Error('Erreur lors de la mise à jour de la clé API');
    }
  };

  const refreshApiKey = async () => {
    await fetchAdminApiKey();
  };

  useEffect(() => {
    fetchAdminApiKey();
  }, []);

  const value = {
    adminApiKey,
    loading,
    error,
    updateAdminApiKey,
    refreshApiKey
  };

  return (
    <AlldebridContext.Provider value={value}>
      {children}
    </AlldebridContext.Provider>
  );
};
