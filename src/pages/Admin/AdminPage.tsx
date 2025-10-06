import React, { useState } from 'react';
import { Users, CreditCard, TrendingUp, Eye, CheckCircle, XCircle, Clock, Download, Search, Link2, Activity, Key, Save, EyeOff, UserPlus, CreditCard as Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FirebaseDownloadsService } from '../../services/firebaseDownloads';
import AlldebridSettings from '../../components/Alldebrid/AlldebridSettings';
import { FirebasePaymentService, Payment } from '../../services/firebasePaymentService';
import { useAuth } from '../../contexts/AuthContext';
import AddUserModal, { UserData } from '../../components/Admin/AddUserModal';
import EditUserModal from '../../components/Admin/EditUserModal';
import DeleteUserModal from '../../components/Admin/DeleteUserModal';
import OrphanUsersPanel from '../../components/Admin/OrphanUsersPanel';
import { FirebaseAuthService, UserProfile } from '../../services/firebaseAuth';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);
  const [showOrphanWarning, setShowOrphanWarning] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');

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

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await FirebaseAuthService.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  React.useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoadingPayments(true);
        setDebugInfo('Chargement des paiements...');

        const allPaymentsData = await FirebasePaymentService.getAllPayments();
        setAllPayments(allPaymentsData);
        setDebugInfo(`Total paiements: ${allPaymentsData.length}`);

        const pendingData = allPaymentsData.filter(p => p.status === 'pending');
        setPayments(pendingData);
        setDebugInfo(`Total: ${allPaymentsData.length} | En attente: ${pendingData.length}`);
      } catch (error: any) {
        console.error('Erreur lors du chargement des paiements:', error);
        setDebugInfo(`Erreur: ${error.message}`);
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
    { title: 'API Service actives', value: '156', change: '+7%', icon: Activity, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20' }
  ];


  const recentUsers = allUsers.slice(0, 4).map(user => ({
    name: user.name,
    email: user.email,
    plan: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
    status: user.status === 'active' ? 'Active' : 'Pending',
    joined: user.createdAt.toLocaleDateString('fr-FR')
  }));

  const handleValidatePayment = async (paymentId: string, action: 'approve' | 'reject') => {
    if (!user) return;

    try {
      await FirebasePaymentService.validatePayment({
        paymentId: paymentId,
        validatedBy: user.id,
        status: action === 'approve' ? 'validated' : 'rejected',
        rejectionReason: action === 'reject' ? 'Paiement refusé par l\'administrateur' : undefined
      });

      const allPaymentsData = await FirebasePaymentService.getAllPayments();
      setAllPayments(allPaymentsData);
      const pendingData = allPaymentsData.filter(p => p.status === 'pending');
      setPayments(pendingData);
      setDebugInfo(`Mis à jour - Total: ${allPaymentsData.length} | En attente: ${pendingData.length}`);
    } catch (error) {
      console.error('Erreur lors de la validation du paiement:', error);
      alert('Erreur lors de la validation du paiement');
    }
  };

  const handleAddUser = async (userData: UserData) => {
    try {
      const existingUser = await FirebaseAuthService.getUserByEmail(userData.email);

      if (existingUser) {
        throw new Error('Cet email est déjà utilisé. L\'utilisateur existe déjà dans la base de données.');
      }

      await FirebaseAuthService.createUserByAdmin(
        userData.email,
        userData.password,
        userData.name,
        userData.plan,
        userData.status
      );

      alert(`Utilisateur ${userData.name} créé avec succès!\n\nMot de passe temporaire: ${userData.password}\n\nVous allez être redirigé vers la page de connexion pour vous reconnecter.`);

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setShowOrphanWarning(true);
        throw new Error('Cet email est déjà utilisé dans Firebase Auth. Un compte existe mais le profil est peut-être manquant.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe est trop faible');
      } else {
        throw new Error(error.message || 'Erreur lors de la création de l\'utilisateur');
      }
    }
  };

  const handleEditUser = async (userId: string, updates: Partial<UserProfile>, newPassword?: string) => {
    try {
      await FirebaseAuthService.updateUserByAdmin(userId, updates);

      if (newPassword) {
        await FirebaseAuthService.updateUserPassword(userId, newPassword);
        setAddUserSuccess('Utilisateur modifié avec succès. Un email de réinitialisation de mot de passe a été envoyé.');
      } else {
        setAddUserSuccess('Utilisateur modifié avec succès');
      }

      setTimeout(() => setAddUserSuccess(null), 5000);

      const users = await FirebaseAuthService.getAllUsers();
      setAllUsers(users);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await FirebaseAuthService.deleteUser(userId);
      setAddUserSuccess('Utilisateur supprimé avec succès');
      setTimeout(() => setAddUserSuccess(null), 5000);

      const users = await FirebaseAuthService.getAllUsers();
      setAllUsers(users);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
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
        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Debug: {debugInfo}
            </p>
          </div>
        )}

        {/* Tous les paiements pour debug */}
        {allPayments.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tous les paiements ({allPayments.length})</h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {allPayments.map(p => (
                <div key={p.id} className="flex justify-between">
                  <span>{p.userName} - {p.userEmail}</span>
                  <span className={`font-medium ${
                    p.status === 'pending' ? 'text-yellow-600' :
                    p.status === 'validated' ? 'text-green-600' : 'text-red-600'
                  }`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Paiements en attente de validation</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Validez ou rejetez les paiements des utilisateurs</p>
              </div>
<div className="flex space-x-2">
                <button
                  onClick={async () => {
                    if (!user) return;
                    try {
                      await FirebasePaymentService.createPayment({
                        userId: user.id,
                        userEmail: user.email,
                        userName: user.name,
                        plan: 'silver',
                        amount: 10000,
                        paymentMethod: 'mvola',
                        reference: `TEST${Date.now()}`
                      });
                      setDebugInfo('Paiement test créé avec succès');

                      const allPaymentsData = await FirebasePaymentService.getAllPayments();
                      setAllPayments(allPaymentsData);
                      const pendingData = allPaymentsData.filter(p => p.status === 'pending');
                      setPayments(pendingData);
                    } catch (error: any) {
                      console.error('Erreur:', error);
                      setDebugInfo(`Erreur lors de la création: ${error.message}`);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Créer test
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoadingPayments(true);
                      const allPaymentsData = await FirebasePaymentService.getAllPayments();
                      setAllPayments(allPaymentsData);
                      const pendingData = allPaymentsData.filter(p => p.status === 'pending');
                      setPayments(pendingData);
                      setDebugInfo(`Rafraîchi - Total: ${allPaymentsData.length} | En attente: ${pendingData.length}`);
                    } catch (error: any) {
                      console.error('Erreur:', error);
                      setDebugInfo(`Erreur: ${error.message}`);
                    } finally {
                      setLoadingPayments(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Rafraîchir
                </button>
              </div>
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

      {showOrphanWarning && (
        <OrphanUsersPanel onRefresh={loadUsers} />
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {loadingUsers ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
                  </td>
                </tr>
              ) : allUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              ) : (
                allUsers
                  .filter(user =>
                    searchQuery === '' ||
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user, index) => (
                    <tr key={user.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          user.plan === 'silver'
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                            : user.plan === 'bronze'
                            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          user.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : user.status === 'suspended'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.createdAt.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {user.totalDownloads || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                            title="Modifier"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
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
      { name: 'Rakoto Andry', requests: 156, plan: 'Silver' },
      { name: 'Hery Razafy', requests: 89, plan: 'Silver' },
      { name: 'Soa Ranaivo', requests: 67, plan: 'Bronze' },
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

      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        onEditUser={handleEditUser}
        user={selectedUser}
      />

      <DeleteUserModal
        isOpen={showDeleteUserModal}
        onClose={() => {
          setShowDeleteUserModal(false);
          setSelectedUser(null);
        }}
        onDeleteUser={handleDeleteUser}
        user={selectedUser}
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
              { id: 'alldebrid', label: 'Monitoring Service', icon: Link2 }
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