import React, { useState } from 'react';
import { X, Tag, Smile, Meh, AlertTriangle, Save } from 'lucide-react';
import { Note, Contact } from '../utils/types';
import { useAuth } from '../contexts/AuthContext';

interface NoteEntryProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSave: (note: Omit<Note, 'id'>) => void;
}

const NoteEntry: React.FC<NoteEntryProps> = ({ isOpen, onClose, contacts, onSave }) => {
  const { currentUser } = useAuth();
  const [selectedContact, setSelectedContact] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Note['type']>('note');
  const [sentiment, setSentiment] = useState<Note['sentiment']>('neutral');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedContact || !content.trim() || !currentUser) return;
    
    setIsSaving(true);
    
    const note: Omit<Note, 'id'> = {
      contactId: selectedContact,
      content: content.trim(),
      date: new Date(),
      tags,
      sentiment,
      type,
      userId: currentUser.uid,
      createdAt: new Date()
    };
    
    try {
      await onSave(note);
      
      // Reset form only after successful save
      setSelectedContact('');
      setContent('');
      setType('note');
      setSentiment('neutral');
      setTags([]);
      setNewTag('');
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la note:', error);
      setIsSaving(false);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
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

  const sentimentOptions = [
    { value: 'positive' as const, icon: Smile, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { value: 'neutral' as const, icon: Meh, color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-500/20' },
    { value: 'needs-attention' as const, icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-500/20' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ajouter une nouvelle note</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Sélection du contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personne
            </label>
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Sélectionner une personne...</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type d'interaction
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['note', 'appel', 'email', 'rencontre'] as const).map((typeOption) => (
                <button
                  key={typeOption}
                  onClick={() => setType(typeOption)}
                  className={`px-3 sm:px-4 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                    type === typeOption
                      ? 'bg-sage-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu de la note
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Que s'est-il passé ? Comment ça s'est déroulé ? Des détails importants à retenir..."
              rows={4}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
          </div>

          {/* Sentiment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comment vous êtes-vous senti ?
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {sentimentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSentiment(option.value)}
                    className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all touch-manipulation ${
                      sentiment === option.value
                        ? `${option.bgColor} ${option.color} border border-current`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="capitalize text-xs sm:text-sm">{
                      option.value === 'positive' ? 'Positif' :
                      option.value === 'needs-attention' ? 'Nécessite attention' :
                      'Neutre'
                    }</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-sage-100 text-sage-700 dark:bg-sage-600/20 dark:text-sage-300 text-xs sm:text-sm rounded-full border border-sage-200 dark:border-sage-600/30"
                >
                  <span className="truncate max-w-20 sm:max-w-none">{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-sage-600 dark:hover:text-sage-200 touch-manipulation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Ajouter un tag..."
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-1 touch-manipulation text-sm sm:text-base"
              >
                <Tag className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
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
            disabled={!selectedContact || !content.trim() || isSaving}
            className={`flex items-center justify-center space-x-2 px-6 py-3 sm:py-2 rounded-lg font-medium transition-all touch-manipulation ${
              !selectedContact || !content.trim() || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-sage-600 hover:bg-sage-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25'
            } text-sm sm:text-base`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEntry;