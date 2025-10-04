import React, { useState } from 'react';
import { X, Mail, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailSetupGuide: React.FC<EmailSetupGuideProps> = ({ isOpen, onClose }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    });
  };

  const templateHTML = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7B896F, #6B7268); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">{{vendor_name}}</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Reçu de vente électronique</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #333; margin-bottom: 20px;">Bonjour {{customer_name}},</h2>
      
      <p style="color: #666; margin-bottom: 25px;">
        Merci pour votre commande ! Voici votre reçu de vente électronique.
      </p>
      
      <!-- Order Info -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #7B896F;">Détails de la commande</h3>
        <p><strong>Numéro:</strong> #{{order_id}}</p>
        <p><strong>Date:</strong> {{order_date}}</p>
        <p><strong>Total:</strong> {{total_amount}}</p>
        <p><strong>Paiement:</strong> {{payment_method}} ({{payment_status}})</p>
      </div>
      
      <!-- Items -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #7B896F; margin-bottom: 15px;">Articles commandés</h3>
        <div style="white-space: pre-line; background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace;">{{items_list}}</div>
      </div>
      
      <!-- Delivery -->
      <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 25px;">
        <h4 style="margin: 0 0 10px 0; color: #1976d2;">Livraison</h4>
        <p style="margin: 0;">{{delivery_address}}</p>
        {{#delivery_instructions}}<p style="margin: 5px 0 0 0; font-style: italic;">Instructions: {{delivery_instructions}}</p>{{/delivery_instructions}}
      </div>
      
      {{#order_notes}}
      <div style="background: #f3e5f5; border-left: 4px solid #9c27b0; padding: 15px; margin-bottom: 25px;">
        <h4 style="margin: 0 0 10px 0; color: #7b1fa2;">Notes</h4>
        <p style="margin: 0;">{{order_notes}}</p>
      </div>
      {{/order_notes}}
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0; font-weight: 600;">Merci pour votre confiance !</p>
      <p style="margin: 5px 0; color: #666;">Ce reçu électronique fait foi de votre achat</p>
      <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        {{vendor_address}}<br>
        Tél: {{vendor_phone}} | Email: {{vendor_email}}
        {{#vendor_nif}}<br>NIF: {{vendor_nif}}{{/vendor_nif}}
        {{#vendor_stat}} | STAT: {{vendor_stat}}{{/vendor_stat}}
      </p>
    </div>
  </div>
</div>
`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Guide de configuration EmailJS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Étapes de configuration */}
          <div className="space-y-6">
            {/* Étape 1 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                Étape 1: Créer un compte EmailJS
              </h3>
              <div className="space-y-2 text-blue-700 dark:text-blue-400 text-sm">
                <p>1. Allez sur <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">EmailJS.com</a></p>
                <p>2. Cliquez sur "Sign Up" pour créer un compte gratuit</p>
                <p>3. Confirmez votre email et connectez-vous</p>
              </div>
              <a 
                href="https://www.emailjs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Créer un compte EmailJS</span>
              </a>
            </div>

            {/* Étape 2 */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                Étape 2: Configurer un service email
              </h3>
              <div className="space-y-2 text-green-700 dark:text-green-400 text-sm">
                <p>1. Dans le dashboard, allez sur "Email Services"</p>
                <p>2. Cliquez "Add New Service"</p>
                <p>3. Choisissez Gmail, Outlook ou votre fournisseur email</p>
                <p>4. Suivez les instructions pour connecter votre compte</p>
                <p>5. Copiez le <strong>Service ID</strong> généré</p>
              </div>
              <a 
                href="https://dashboard.emailjs.com/admin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 mt-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ouvrir Email Services</span>
              </a>
            </div>

            {/* Étape 3 */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">
                Étape 3: Créer un template d'email
              </h3>
              <div className="space-y-2 text-purple-700 dark:text-purple-400 text-sm mb-4">
                <p>1. Allez sur "Email Templates"</p>
                <p>2. Cliquez "Create New Template"</p>
                <p>3. Copiez le code HTML ci-dessous dans votre template</p>
                <p>4. Sauvegardez et copiez le <strong>Template ID</strong></p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-xs font-mono">Template HTML pour EmailJS</span>
                  <button
                    onClick={() => copyToClipboard(templateHTML, 'Template HTML')}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                  >
                    {copiedText === 'Template HTML' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Copié!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-gray-300 text-xs overflow-x-auto max-h-40">
                  <code>{templateHTML}</code>
                </pre>
              </div>
              
              <a 
                href="https://dashboard.emailjs.com/admin/templates" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 mt-3 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ouvrir Email Templates</span>
              </a>
            </div>

            {/* Étape 4 */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">
                Étape 4: Obtenir la clé publique
              </h3>
              <div className="space-y-2 text-orange-700 dark:text-orange-400 text-sm">
                <p>1. Allez sur "Account" → "General"</p>
                <p>2. Trouvez la section "Public Key"</p>
                <p>3. Copiez votre clé publique</p>
                <p>4. Collez-la dans la configuration ci-dessus</p>
              </div>
              <a 
                href="https://dashboard.emailjs.com/admin/account" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 mt-3 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ouvrir Account Settings</span>
              </a>
            </div>
          </div>

          {/* Résumé final */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Résumé de la configuration
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">1</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Service ID depuis Email Services</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">2</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Template ID depuis Email Templates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Public Key depuis Account Settings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSetupGuide;