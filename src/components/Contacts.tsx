import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Contact } from '../utils/types';
import ContactCard from './ContactCard';

interface ContactsProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onToggleStar: (id: string) => void;
  onAddContact: () => void;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onContactClick, onToggleStar, onAddContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'starred' | 'needs-attention'>('all');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(contact.tags) ? contact.tags : []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'starred' && contact.starred) ||
                         (selectedFilter === 'needs-attention' && contact.sentiment === 'needs-attention');
    
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all' as const, label: 'Toutes les personnes', count: contacts.length },
    { id: 'starred' as const, label: 'Favoris', count: contacts.filter(c => c.starred).length },
    { id: 'needs-attention' as const, label: 'Nécessite attention', count: contacts.filter(c => c.sentiment === 'needs-attention').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Vos Clients</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Gérez votre base clients</p>
        </div>
        <button
          onClick={onAddContact}
          className="flex items-center justify-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-4 py-3 sm:py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Ajouter un client</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des clients ou des tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 sm:py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
        </div>
        
        <div className="flex items-center space-x-2 lg:flex-shrink-0">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm sm:text-base w-full lg:w-auto"
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onClick={() => onContactClick(contact)}
            onToggleStar={onToggleStar}
          />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-500" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun client trouvé</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {searchTerm ? 'Essayez d\'ajuster vos critères de recherche' : 'Commencez à ajouter des clients à votre base'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Contacts;