import React, { useState } from 'react';
import { X, Package, User, Calendar, MapPin, CreditCard, Save, Truck } from 'lucide-react';
import { Order, Contact, Product, OrderItem } from '../utils/types';
import { useAuth } from '../contexts/AuthContext';
import { generateReceiptNumber } from '../services/receiptNumberingService';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Contact[];
  products: Product[];
  onSave: (order: Omit<Order, 'id'>) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, customers, products, onSave }) => {
  const { currentUser } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mvola' | 'orange-money' | 'airtel-money' | 'transfer' | 'check'>('cash');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
    const delivery = parseInt(deliveryFee) || 0;
    return itemsTotal + delivery;
  };

  const handleSave = async () => {
    if (!selectedCustomer || items.length === 0 || !deliveryDate || !deliveryAddress.trim() || !currentUser) return;
    
    setIsSaving(true);
    
    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const orderItems: OrderItem[] = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error('Produit non trouvé');
      
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity
      };
    });

    // Générer le numéro de reçu avec Firebase
    const receiptNumber = await generateReceiptNumber(currentUser.uid);

    const order: Omit<Order, 'id'> = {
      receiptNumber,
      customerId: selectedCustomer,
      customerName: customer.name,
      customerPhone: customer.phone,
      orderDate: new Date(),
      deliveryDate: new Date(deliveryDate),
      status: 'pending',
      items: orderItems,
      totalAmount: calculateTotal(),
      paymentStatus: 'pending',
      paymentMethod,
      deliveryAddress: customer.address || {
        street: deliveryAddress.trim(),
        city: 'Antananarivo',
        postalCode: '101',
        country: 'Madagascar'
      },
      notes: notes.trim() || undefined,
      deliveryFee: parseInt(deliveryFee) || 0,
      userId: currentUser.uid,
      createdAt: new Date()
    };
    
    try {
      await onSave(order);
      
      // Reset form only after successful save
      setSelectedCustomer('');
      setDeliveryDate('');
      setDeliveryAddress('');
      setDeliveryFee('');
      setPaymentMethod('cash');
      setNotes('');
      setItems([]);
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande:', error);
      setIsSaving(false);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    // Convertir en nombre entier et formater avec des espaces pour les milliers
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Nouvelle commande</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Client et livraison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Client *
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Sélectionner un client...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date de livraison *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Lieu de livraison *
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Adresse de livraison complète..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Méthode de paiement
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { value: 'cash', label: 'Espèces' },
                { value: 'mvola', label: 'MVola' },
                { value: 'orange-money', label: 'Orange Money' },
                { value: 'airtel-money', label: 'Airtel Money' },
                { value: 'transfer', label: 'Virement' },
                { value: 'check', label: 'Chèque' }
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                    paymentMethod === method.value
                      ? 'bg-sage-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Package className="w-4 h-4 inline mr-1" />
                Articles de la commande *
              </label>
              <button
                onClick={addItem}
                className="px-3 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs sm:text-sm rounded-lg transition-colors touch-manipulation w-full sm:w-auto"
              >
                Ajouter un article
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm sm:text-base"
                  >
                    <option value="">Sélectionner un produit...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 sm:w-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 sm:px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm sm:text-base"
                    />
                    
                    <div className="w-20 sm:w-24 text-right text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                      {item.productId ? formatCurrency((products.find(p => p.id === item.productId)?.price || 0) * item.quantity) : '-'}
                    </div>
                    
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-4 p-3 sm:p-4 bg-sage-50 dark:bg-sage-900/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Sous-total articles</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(items.reduce((total, item) => {
                      const product = products.find(p => p.id === item.productId);
                      return total + (product ? product.price * item.quantity : 0);
                    }, 0))}
                  </span>
                </div>
                {deliveryFee && parseInt(deliveryFee) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Frais de livraison</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(parseInt(deliveryFee))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-sage-200 dark:border-sage-700">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Total général</span>
                  <span className="text-lg sm:text-xl font-bold text-sage-600 dark:text-sage-400">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Frais de livraison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Truck className="w-4 h-4 inline mr-1" />
              Frais de livraison
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="500"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="0"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                Ar
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Laisser vide ou 0 pour une livraison gratuite
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spéciales, remarques..."
              rows={2}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-3 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCustomer || items.length === 0 || !deliveryDate || !deliveryAddress.trim() || isSaving}
            className={`flex items-center justify-center space-x-2 px-6 py-3 sm:py-2 rounded-lg font-medium transition-all touch-manipulation ${
              !selectedCustomer || items.length === 0 || !deliveryDate || !deliveryAddress.trim() || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-sage-600 hover:bg-sage-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25'
            } text-sm sm:text-base`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Création...' : 'Créer la commande'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;