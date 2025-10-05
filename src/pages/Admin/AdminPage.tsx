import React, { useState } from 'react';
import { Users, CreditCard, TrendingUp, Eye, CheckCircle, XCircle, Clock, Download, Search, Link2, Activity, Key, Save, EyeOff, UserPlus } from 'lucide-react';
import { FirebaseDownloadsService } from '../../services/firebaseDownloads';
import AlldebridSettings from '../../components/Alldebrid/AlldebridSettings';
import { FirebasePaymentService, Payment } from '../../services/firebasePaymentService';
import { useAuth } from '../../contexts/AuthContext';
import AddUserModal, { UserData } from '../../components/Admin/AddUserModal';
import { FirebaseAuthService } from '../../services/firebaseAuth';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [globalStats, setGlobalStats] = useState({
    totalDownloads: 0,
    totalUsers: 0,
    totalSize: 0,
    todayDownloads: 0
  });
  const [adminApiKey, setAdminApiKey] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await FirebaseDownloadsService.getGlobalStats();
        setGlobalStats(stats);
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
      }
    };

    loadStats();
  }, []);

  React.useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoadingPayments(true);
        const data = await FirebasePaymentService.getPendingPayments();
        setPayments(data);
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
      } finally {
        setLoadingPayments(false);
      }
    };

    if (activeTab === 'payments') {
      loadPayments();
    }
  }, [activeTab]);
  // Mock data for demonstration
  const stats = [
    { title: 'Utilisateurs actifs', value: globalStats.totalUsers.toLocaleString(), change: '+12%', icon: Users, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20' },
    { title: 'Liens déverrouillés', value: globalStats.totalDownloads.toLocaleString(), change: '+23%', icon: Link2, color: 'text-green-500 bg-green-100 dark:bg-green-900/20' },
    { title: 'Téléchargements aujourd\'hui', value: globalStats.todayDownloads.toLocaleString(), change: '+18%', icon: Download, color: 'text-green-500 bg-green-100 dark:bg-green-900/20' },
    { title: 'API Alldebrid actives', value: '156', change: '+7%', icon: Activity, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20' }
  ];


  const recentUsers = [
    { name: 'Rakoto Andry', email: 'rakoto@email.com', plan: 'Silver', status: 'Active', joined: '2025-01-12' },
    { name: 'Hery Razafy', email: 'hery@email.com', plan: 'Gold', status: 'Active', joined: '2025-01-11' },
    { name: 'Soa Ranaivo', email: 'soa@email.com', plan: 'Bronze', status: 'Pending', joined: '2025-01-11' },
    { name: 'Nivo Ratsimba', email: 'nivo@email.com', plan: 'Free', status: 'Active', joined: '2025-01-10' }
  ];

  const handleValidatePayment = async (paymentId: string, action: 'approve' | 'reject') => {
    if (!user) return;

    try {
      await FirebasePaymentService.validatePayment({
        paymentId: paymentId,
        validatedBy: user.id,
        status: action === 'approve' ? 'validated' : 'rejected',
        rejectionReason: action === 'reject' ? 'Paiement refusé par l\'administrateur' : undefined
      });

      const updatedPayments = await FirebasePaymentService.getPendingPayments();
      setPayments(updatedPayments);
    } catch (error) {
      console.error('Erreur lors de la validation du paiement:', error);
      alert('Erreur lors de la validation du paiement');
    }
  };

  const handleAddUser = async (userData: UserData) => {
    try {
      await FirebaseAuthService.createUserByAdmin(
        userData.email,
        userData.password,
        userData.name,
        userData.plan,
        userData.status
      );

      setAddUserSuccess(`Utilisateur ${userData.name} créé avec succès. Mot de passe temporaire: ${userData.password}`);
      setTimeout(() => setAddUserSuccess(null), 10000);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cet email est déjà utilisé');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe est trop faible');
      } else {
        throw new Error(error.message || 'Erreur lors de la création de l\'utilisateur');
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nouveaux utilisateurs</h3>
          <div className="space-y-3">
            {recentUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                  }`}>
                    {user.status}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{user.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenus mensuels</h3>
          <div className="h-48 bg-gradient-to-r from-red-100 to-green-100 dark:from-red-900/20 dark:to-green-900/20 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">Graphique des revenus</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentValidation = () => {

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Paiements en attente de validation</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Validez ou rejetez les paiements des utilisateurs</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const data = await FirebasePaymentService.getPendingPayments();
                    setPayments(data);
                  } catch (error) {
                    console.error('Erreur:', error);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rafraîchir
              </button>
            </div>
          </div>

          {loadingPayments ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Chargement des paiements...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-gray-600 dark:text-gray-400">Aucun paiement en attente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Méthode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.userName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          payment.plan === 'bronze'
                            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
                            : payment.plan === 'silver'
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {payment.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {payment.amount.toLocaleString()} MGA
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {FirebasePaymentService.formatPaymentMethod(payment.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {FirebasePaymentService.formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleValidatePayment(payment.id, 'approve')}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                            title="Valider"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleValidatePayment(payment.id, 'reject')}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                            title="Rejeter"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUserManagement = () => (
    <div className="space-y-6">
      {addUserSuccess && (
        <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-green-800 dark:text-green-400 text-sm font-medium">{addUserSuccess}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez les comptes utilisateurs et leurs abonnements</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Ajouter un utilisateur</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Téléchargements</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...recentUsers, ...recentUsers].map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.plan === 'Gold' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        : user.plan === 'Silver'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                        : user.plan === 'Bronze'
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {Math.floor(Math.random() * 100) + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                        Suspendre
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function renderAlldebridMonitoring() {
    const alldebridStats = [
      { label: 'Requêtes API aujourd\'hui', value: '2,847', color: 'text-blue-600' },
      { label: 'Quota utilisé', value: '68%', color: 'text-yellow-600' },
      { label: 'Erreurs API', value: '12', color: 'text-red-600' },
      { label: 'Temps de réponse moyen', value: '1.2s', color: 'text-green-600' }
    ];

    const topUsers = [
      { name: 'Rakoto Andry', requests: 156, plan: 'Gold' },
      { name: 'Hery Razafy', requests: 89, plan: 'Silver' },
      { name: 'Soa Ranaivo', requests: 67, plan: 'Silver' },
      { name: 'Nivo Ratsimba', requests: 45, plan: 'Bronze' }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Alldebrid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {alldebridStats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top utilisateurs API */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Top utilisateurs API
            </h3>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Plan {user.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 dark:text-blue-400">{user.requests}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">requêtes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring en temps réel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Activité en temps réel
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Lien déverrouillé avec succès</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">1fichier.com • Il y a 2s</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Torrent ajouté</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ubuntu 22.04 • Il y a 15s</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Quota utilisateur atteint</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Plan Bronze • Il y a 1m</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration API Alldebrid pour l'admin */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Configuration API Alldebrid Admin
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Configurez votre clé API Alldebrid pour gérer les fonctionnalités premium de la plateforme
            </p>
            <AlldebridSettings onApiKeyChange={setAdminApiKey} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={handleAddUser}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel Administrateur
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez votre plateforme MadaLink
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'payments', label: 'Validation paiements', icon: CreditCard },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'alldebrid', label: 'Monitoring Alldebrid', icon: Link2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'payments' && renderPaymentValidation()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'alldebrid' && renderAlldebridMonitoring()}
        </div>
      </div>
    </>
  );
};

export default AdminPage;