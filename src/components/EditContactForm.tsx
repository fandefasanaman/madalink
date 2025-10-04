import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Tag, MapPin, Heart, Save } from 'lucide-react';
import { Contact } from '../utils/types';

interface EditContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSave: (contact: Contact) => void;
}

const EditContactForm: React.FC<EditContactFormProps> = ({ isOpen, onClose, contact, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    metAt: '',
    sentiment: 'neutral' as Contact['sentiment'],
    customerStatus: 'active' as Contact['customerStatus'],
    orderFrequency: 'monthly' as Contact['orderFrequency'],
    paymentMethod: 'cash' as Contact['paymentMethod']
  });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'Madagascar',
    deliveryInstructions: ''
  });
  const [deliveryPreferences, setDeliveryPreferences] = useState({
    preferredDay: 'saturday' as const,
    preferredTime: 'morning' as const,
    frequency: 'weekly' as const
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [starred, setStarred] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        relationship: contact.relationship,
        metAt: contact.metAt || '',
        sentiment: contact.sentiment,
        customerStatus: contact.customerStatus,
        orderFrequency: contact.orderFrequency,
        paymentMethod: contact.paymentMethod || 'cash'
      });
      setAddress(contact.address || {
        street: '',
        city: '',
        postalCode: '',
        country: 'Madagascar',
        deliveryInstructions: ''
      });
      setDeliveryPreferences({
        preferredDay: contact.deliveryPreferences?.preferredDay || 'saturday',
        preferredTime: contact.deliveryPreferences?.preferredTime || 'morning',
        frequency: contact.deliveryPreferences?.frequency || 'weekly'
      });
      setTags(Array.isArray(contact.tags) ? contact.tags : []);
      setStarred(contact.starred);
    }
  }, [contact]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleDeliveryChange = (field: string, value: string) => {
    setDeliveryPreferences(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!contact || !formData.name.trim()) return;
    
    setIsSaving(true);
    
    const updatedContact: Contact = {
      ...contact,
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      relationship: formData.relationship.trim() || 'Contact',
      metAt: formData.metAt.trim() || undefined,
      sentiment: formData.sentiment,
      customerStatus: formData.customerStatus,
      orderFrequency: formData.orderFrequency,
      paymentMethod: formData.paymentMethod,
      address: address.street ? address : undefined,
      deliveryPreferences: {
        ...deliveryPreferences,
        nextDelivery: contact.deliveryPreferences?.nextDelivery
      },
      tags,
      starred
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(updatedContact);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Modifier le client</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Heart className="w-4 h-4 inline mr-1" />
                Relation
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+261 32 12 345 67"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adresse de livraison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Rue
                </label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code postal</label>
                <input
                  type="text"
                  value={address.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions de livraison</label>
                <textarea
                  value={address.deliveryInstructions}
                  onChange={(e) => handleAddressChange('deliveryInstructions', e.target.value)}
                  rows={2}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Préférences commerciales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut client</label>
              <select
                value={formData.customerStatus}
                onChange={(e) => handleInputChange('customerStatus', e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fréquence de commande</label>
              <select
                value={formData.orderFrequency}
                onChange={(e) => handleInputChange('orderFrequency', e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="weekly">Hebdomadaire</option>
                <option value="bi-weekly">Bi-hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
                <option value="occasional">Occasionnelle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Méthode de paiement</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="cash">Espèces</option>
                <option value="mvola">MVola</option>
                <option value="orange-money">Orange Money</option>
                <option value="airtel-money">Airtel Money</option>
                <option value="transfer">Virement</option>
                <option value="check">Chèque</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-3 py-1 bg-sage-100 text-sage-700 dark:bg-sage-600/20 dark:text-sage-300 text-sm rounded-full border border-sage-200 dark:border-sage-600/30"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-sage-600 dark:hover:text-sage-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Ajouter un tag..."
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Favori */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="starred"
              checked={starred}
              onChange={(e) => setStarred(e.target.checked)}
              className="w-4 h-4 text-sage-600 bg-gray-100 border-gray-300 rounded focus:ring-sage-500"
            />
            <label htmlFor="starred" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Marquer comme favori
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim() || isSaving}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
              !formData.name.trim() || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-sage-600 hover:bg-sage-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditContactForm;