import React, { useState } from 'react';
import { CreditCard, Upload, CheckCircle, Clock, AlertCircle, Smartphone } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('silver');
  const [paymentMethod, setPaymentMethod] = useState('mvola');
  const [step, setStep] = useState(1);
  const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null);

  const plans = {
    bronze: { name: 'Bronze', price: 1000, duration: 'mois' },
    silver: { name: 'Silver', price: 3000, duration: 'mois' },
    gold: { name: 'Gold', price: 8000, duration: 'mois' }
  };

  const paymentNumbers = {
    mvola: '034 99 773 93',
    orange: '032 87 654 32',
    airtel: '033 55 123 45'
  };

  const generateReference = () => {
    return `MDL${Date.now().toString().slice(-6)}`;
  };

  const [reference] = useState(generateReference());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (uploadedReceipt) {
      setStep(4); // Payment submitted, waiting for validation
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Paiement en cours de validation
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Votre reçu de paiement a été reçu avec succès. Notre équipe procède à la validation de votre paiement.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Temps de validation habituel
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    • Pendant les heures de bureau: 2-4 heures<br/>
                    • En soirée et weekend: jusqu'à 24 heures
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex justify-between">
                <span>Plan sélectionné:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {plans[selectedPlan as keyof typeof plans].name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Montant:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {plans[selectedPlan as keyof typeof plans].price.toLocaleString()} MGA
                </span>
              </div>
              <div className="flex justify-between">
                <span>Référence:</span>
                <span className="font-medium text-gray-900 dark:text-white">{reference}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Vous recevrez une notification par email dès que votre paiement sera validé.
            </p>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-green-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-green-700 transition-all duration-200"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber
                      ? 'bg-gradient-to-r from-red-600 to-green-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 ml-4 ${
                      step > stepNumber ? 'bg-gradient-to-r from-red-600 to-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-16">
            <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Paiement</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Choisissez votre plan
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(plans).map(([key, plan]) => (
                    <div
                      key={key}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPlan === key
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedPlan(key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full mr-3 ${
                              selectedPlan === key ? 'bg-red-500' : 'border-2 border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Plan {plan.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {key === 'bronze' && 'Pour un usage régulier'}
                              {key === 'silver' && 'Le plus populaire'}
                              {key === 'gold' && 'Pour les utilisateurs intensifs'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {plan.price.toLocaleString()}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-1">MGA/{plan.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-red-600 to-green-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-green-700 transition-all duration-200"
                >
                  Continuer
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Instructions de paiement
                </h2>
                
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Choisissez votre méthode de paiement
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(paymentNumbers).map(([method, number]) => (
                      <div
                        key={method}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          paymentMethod === method
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        <div className="text-center">
                          <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                            {method === 'mvola' ? 'MVola' : method === 'orange' ? 'Orange Money' : 'Airtel Money'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Instructions de paiement {paymentMethod === 'mvola' ? 'MVola' : paymentMethod === 'orange' ? 'Orange Money' : 'Airtel Money'}
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Numéro à appeler:</span>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {paymentNumbers[paymentMethod as keyof typeof paymentNumbers]}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Montant exact:</span>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {plans[selectedPlan as keyof typeof plans].price.toLocaleString()} MGA
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        ⚠️ Référence obligatoire à inclure dans le libellé du paiement:
                      </p>
                      <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
                        {reference}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-blue-800 dark:text-blue-200">
                      <p><strong>Étapes à suivre:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>Composez le numéro {paymentMethod === 'mvola' ? '*111#' : paymentMethod === 'orange' ? '*144#' : '*123#'}</li>
                        <li>Choisissez "Envoyer de l'argent" ou "Transfert"</li>
                        <li>Entrez le numéro: <strong>{paymentNumbers[paymentMethod as keyof typeof paymentNumbers]}</strong></li>
                        <li>Montant: <strong>{plans[selectedPlan as keyof typeof plans].price.toLocaleString()} MGA</strong></li>
                        <li>Dans le libellé/motif, écrivez: <strong>{reference}</strong></li>
                        <li>Confirmez la transaction</li>
                        <li>Prenez une capture d'écran du reçu de confirmation</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-green-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-green-700 transition-all duration-200"
                >
                  J'ai effectué le paiement
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Envoyez votre reçu de paiement
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Important: Vérifiez votre reçu avant l'envoi
                        </p>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                          <li>• Le montant doit être exactement {plans[selectedPlan as keyof typeof plans].price.toLocaleString()} MGA</li>
                          <li>• La référence {reference} doit être visible</li>
                          <li>• Le numéro de destination doit être {paymentNumbers[paymentMethod as keyof typeof paymentNumbers]}</li>
                          <li>• L'image doit être claire et lisible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reçu de paiement (capture d'écran ou photo)
                    </label>
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="receipt-upload"
                            className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                          >
                            <span>Télécharger un fichier</span>
                            <input
                              id="receipt-upload"
                              name="receipt-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="sr-only"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          PNG, JPG, PDF jusqu'à 10MB
                        </p>
                      </div>
                    </div>
                    
                    {uploadedReceipt && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                          <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                            Fichier téléchargé: {uploadedReceipt.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Récapitulatif</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span>{plans[selectedPlan as keyof typeof plans].name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant:</span>
                        <span>{plans[selectedPlan as keyof typeof plans].price.toLocaleString()} MGA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Méthode:</span>
                        <span className="capitalize">{paymentMethod === 'mvola' ? 'MVola' : paymentMethod === 'orange' ? 'Orange Money' : 'Airtel Money'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Référence:</span>
                        <span>{reference}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={!uploadedReceipt}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-green-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Envoyer et finaliser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Résumé de votre commande
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan sélectionné:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plans[selectedPlan as keyof typeof plans].name}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Durée:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    1 {plans[selectedPlan as keyof typeof plans].duration}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Prix:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plans[selectedPlan as keyof typeof plans].price.toLocaleString()} MGA
                  </span>
                </div>
                
                <hr className="border-gray-200 dark:border-gray-700" />
                
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {plans[selectedPlan as keyof typeof plans].price.toLocaleString()} MGA
                  </span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/20 dark:to-green-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Besoin d'aide ?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Notre équipe est disponible pour vous accompagner dans votre paiement.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  WhatsApp: +261 34 XX XXX XX
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Email: support@madalink.mg
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;