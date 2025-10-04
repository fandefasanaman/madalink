import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'mg';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { fr: 'Accueil', mg: 'Fandraisana' },
  'nav.pricing': { fr: 'Tarifs', mg: 'Vidiny' },
  'nav.login': { fr: 'Connexion', mg: 'Fidirana' },
  'nav.register': { fr: 'S\'inscrire', mg: 'Hisoratra anarana' },
  'nav.dashboard': { fr: 'Tableau de bord', mg: 'Dashboard' },
  'nav.logout': { fr: 'Déconnexion', mg: 'Hivoaka' },
  
  // Homepage
  'home.title': { fr: 'Téléchargez sans limites avec MadaLink', mg: 'Maka rakitra tsy misy fetra amin\'ny MadaLink' },
  'home.subtitle': { fr: 'La plateforme premium de téléchargement adaptée à Madagascar', mg: 'Sehatra premium ho an\'ny fanalana rakitra natao ho an\'i Madagasikara' },
  'home.cta': { fr: 'Commencer maintenant', mg: 'Manomboka izao' },
  
  // Auth
  'auth.email': { fr: 'Adresse e-mail', mg: 'Adiresy e-mail' },
  'auth.password': { fr: 'Mot de passe', mg: 'Teny miafina' },
  'auth.name': { fr: 'Nom complet', mg: 'Anarana feno' },
  'auth.login': { fr: 'Se connecter', mg: 'Hiditra' },
  'auth.register': { fr: 'S\'inscrire', mg: 'Hisoratra anarana' },
  
  // Plans
  'plans.free': { fr: 'Gratuit', mg: 'Maimaim-poana' },
  'plans.bronze': { fr: 'Bronze', mg: 'Bronze' },
  'plans.silver': { fr: 'Silver', mg: 'Silver' },
  'plans.gold': { fr: 'Gold', mg: 'Gold' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('madalink_language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('madalink_language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};