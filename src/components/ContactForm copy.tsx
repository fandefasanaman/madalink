import React, { useState } from 'react';
import { X, User, Mail, Phone, Tag, MapPin, Heart, Save } from 'lucide-react';
import { Contact } from '../utils/types';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, 'id' | 'notes'>) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    metAt: '',
    sentiment: 'neutral' as Contact['sentiment']
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [starred, setStarred] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    
    const contact: Omit<Contact, 'id' | 'notes'> = {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      relationship: formData.relationship.trim() || 'Contact',
      metAt: formData.metAt.trim() || undefined,
      sentiment: formData.sentiment,
      tags,
      starred,
      lastContact: undefined,
      nextReminder: undefined
    };
    
    // Simulate save animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(contact);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      metAt: '',
      sentiment: 'neutral'
    });
    setTags([]);
    setNewTag('');
    setStarred(false);
    setIsSaving(false);
    onClose();
  };

  const relationshipSuggestions = [
    'Ami proche', 'Ami', 'Collègue', 'Ex-collègue', 'Client', 'Fournisseur',
    'Mentor', 'Famille', 'Voisin', 'Contact professionnel', 'Partenaire'
  ];

  const tagSuggestions = [
    'ami', 'famille', 'collègue', 'client', 'mentor', 'créatif', 'tech',
    'startup', 'designer', 'développeur', 'manager', 'entrepreneur'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ajouter une nouvelle personne</h2>
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
                placeholder="Jean Dupont"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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
                placeholder="Ami, Collègue, Client..."
                list="relationship-suggestions"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
              <datalist id="relationship-suggestions">
                {relationshipSuggestions.map(suggestion => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
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
                placeholder="jean@example.com"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Où vous vous êtes rencontrés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Où vous vous êtes rencontrés
            </label>
            <input
              type="text"
              value={formData.metAt}
              onChange={(e) => handleInputChange('metAt', e.target.value)}
              placeholder="Conférence, travail, ami commun..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>

          {/* Sentiment initial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Première impression
            </label>
            <div className="flex space-x-2">
              {[
                { value: 'positive', label: 'Positive', color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/20' },
                { value: 'neutral', label: 'Neutre', color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-500/20' },
                { value: 'needs-attention', label: 'À revoir', color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/20' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('sentiment', option.value)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    formData.sentiment === option.value
                      ? `${option.color} border border-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
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
                list="tag-suggestions"
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
              <datalist id="tag-suggestions">
                {tagSuggestions.map(suggestion => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
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
              className="w-4 h-4 text-sage-600 bg-gray-100 border-gray-300 rounded focus:ring-sage-500 dark:focus:ring-sage-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
            <span>{isSaving ? 'Enregistrement...' : 'Ajouter la personne'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;