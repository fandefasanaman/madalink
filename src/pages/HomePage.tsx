import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Zap, Shield, Globe, Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Zap,
      title: 'Vitesse optimale',
      description: 'Téléchargements ultra-rapides même avec une connexion lente',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Tous vos téléchargements sont sécurisés et privés',
      color: 'text-green-500'
    },
    {
      icon: Globe,
      title: 'Multi-hébergeurs',
      description: 'Support de tous les hébergeurs de fichiers populaires',
      color: 'text-blue-500'
    }
  ];

  const testimonials = [
    {
      name: 'Rakoto Andry',
      location: 'Antananarivo',
      rating: 5,
      comment: 'MadaLink m\'a permis de télécharger tous mes fichiers rapidement. Le service client en malgache est fantastique!'
    },
    {
      name: 'Hery Razafy', 
      location: 'Fianarantsoa',
      rating: 5,
      comment: 'Même avec ma connexion lente, je peux télécharger sans problème. Les prix sont très abordables.'
    },
    {
      name: 'Soa Ranaivo',
      location: 'Toamasina',
      rating: 5,
      comment: 'Interface très simple et paiement MVola facile. Je recommande à tous!'
    }
  ];

  const plans = [
    {
      name: 'Essai 15 jours',
      price: '3 500',
      period: '15 jours',
      features: ['Accès complet 15 jours', 'Vitesse 1 MB/s', '10 téléchargements/jour'],
      color: 'border-gray-300',
      popular: false
    },
    {
      name: 'Bronze',
      price: '7 000',
      period: 'mois',
      features: ['50 téléchargements/jour', 'Vitesse 2 MB/s', 'Support par email'],
      color: 'border-orange-400',
      popular: false
    },
    {
      name: 'Silver',
      price: '10 000',
      period: 'mois',
      features: ['Téléchargements illimités', 'Vitesse 2 MB/s', 'Support prioritaire'],
      color: 'border-gray-400',
      popular: true
    },
    {
      name: 'Gold',
      price: '15 000',
      period: 'mois',
      features: ['Téléchargements illimités', 'Vitesse 10 MB/s', 'Support VIP 24/7'],
      color: 'border-yellow-400',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-green-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <span>{t('home.cta')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">1M+</div>
              <div className="text-gray-600 dark:text-gray-400">Fichiers téléchargés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400">Uptime serveur</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir MadaLink ?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une plateforme conçue spécialement pour répondre aux besoins des utilisateurs malgaches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-lg mb-4`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tarifs adaptés à Madagascar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Paiement facile via MVola ou Orange Money.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 bg-white dark:bg-gray-900 rounded-xl border-2 ${plan.color} ${
                  plan.popular ? 'ring-4 ring-red-200 dark:ring-red-800 transform scale-105' : ''
                } transition-all duration-300 hover:shadow-lg`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-600 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Plus populaire
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      MGA/{plan.period}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className={`block w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-red-600 to-green-600 text-white hover:from-red-700 hover:to-green-700 transform hover:scale-105'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Choisir ce plan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez pourquoi des milliers de Malgaches font confiance à MadaLink
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs malgaches qui téléchargent déjà leurs fichiers avec MadaLink
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Commencer gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;