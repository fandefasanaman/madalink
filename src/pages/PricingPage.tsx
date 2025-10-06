import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star } from 'lucide-react';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Essai 15 jours',
      price: '3 500',
      period: 'MGA/15 jours',
      description: 'Parfait pour découvrir',
      features: [
        'Accès complet pendant 15 jours',
        'Vitesse maximale',
        '10 téléchargements par jour',
        'Support communautaire',
        'Formats basiques supportés'
      ],
      color: 'border-gray-300 dark:border-gray-600',
      popular: false,
      buttonText: 'Commencer l\'essai',
      buttonColor: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
      name: 'Bronze',
      price: '7 000',
      period: 'MGA/mois',
      description: 'Pour un usage régulier',
      features: [
        '50 téléchargements par jour',
        'Vitesse maximale',
        'Support par email',
        'Tous formats supportés',
        'Historique de 30 jours'
      ],
      color: 'border-orange-400',
      popular: false,
      buttonText: 'Choisir Bronze',
      buttonColor: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700'
    },
    {
      name: 'Silver',
      price: '10 000',
      period: 'MGA/mois',
      description: 'Le plus populaire',
      features: [
        'Téléchargements illimités',
        'Vitesse maximale',
        'Support prioritaire',
        'Toutes fonctionnalités premium',
        'Reprise automatique'
      ],
      color: 'border-red-500',
      popular: true,
      buttonText: 'Choisir Silver',
      buttonColor: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700'
    }
  ];

  const paymentMethods = [
    {
      name: 'MVola (Telma)',
      logo: '📱',
      description: 'Paiement rapide et sécurisé',
      popular: true
    },
    {
      name: 'Orange Money',
      logo: '🟠',
      description: 'Simple et accessible',
      popular: true
    },
    {
      name: 'Airtel Money',
      logo: '🔴',
      description: 'Paiement mobile facile',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tarifs adaptés à Madagascar
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Paiement facile via Mobile Money malgache.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 ${plan.color} ${
                plan.popular ? 'ring-4 ring-red-200 dark:ring-red-800 transform scale-105' : ''
              } p-6 transition-all duration-300 hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-red-600 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full py-3 px-4 rounded-lg font-medium text-center transition-all duration-200 transform hover:scale-105 ${plan.buttonColor}`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Méthodes de paiement acceptées
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-lg border-2 ${
                  method.popular ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'
                } transition-all duration-300 hover:shadow-md`}
              >
                <div className="text-4xl mb-3">{method.logo}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {method.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {method.description}
                </p>
                {method.popular && (
                  <div className="mt-3">
                    <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-1 rounded-full text-xs font-medium">
                      Recommandé
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              💡 <strong>Processus simple:</strong> Choisissez votre plan → Effectuez le paiement Mobile Money → Uploadez le reçu → Validation automatique en moins de 24h
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Comment effectuer un paiement ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Sélectionnez votre plan, suivez les instructions de paiement MVola/Orange Money, puis uploadez votre reçu. L'activation se fait automatiquement après validation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Puis-je changer de plan ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Quelle est la vitesse réelle de téléchargement ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  La vitesse dépend de votre connexion internet. Nos serveurs sont optimisés pour Madagascar avec des vitesses allant de 500 KB/s (gratuit) à 10 MB/s (Silver).
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Combien de temps pour l'activation ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  L'activation se fait généralement en moins de 4 heures pendant les heures de bureau (8h-18h). Maximum 24h les weekends et jours fériés.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Y a-t-il une garantie de remboursement ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Nous offrons une garantie de satisfaction de 7 jours. Si vous n'êtes pas satisfait, contactez notre support pour un remboursement complet.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Puis-je partager mon compte ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Non, chaque compte est personnel. Chaque compte est strictement personnel et limité à une connexion à la fois.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;