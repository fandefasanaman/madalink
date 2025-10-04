import React from 'react';
import { Download, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-red-500 to-green-500 rounded-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">MadaLink</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              La plateforme premium de téléchargement adaptée à Madagascar. 
              Téléchargez vos fichiers rapidement et en toute sécurité avec nos serveurs optimisés.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              Fait avec <Heart className="h-4 w-4 mx-1 text-red-500" /> à Madagascar
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MadaLink. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;