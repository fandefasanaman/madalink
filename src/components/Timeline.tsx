import React from 'react';
import { MessageCircle, Phone, Mail, Users, Calendar } from 'lucide-react';
import { Note, Contact } from '../utils/types';

interface TimelineProps {
  notes: Note[];
  contacts: Contact[];
}

const Timeline: React.FC<TimelineProps> = ({ notes, contacts }) => {
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Contact inconnu';
  };

  const getTypeIcon = (type: Note['type']) => {
    switch (type) {
      case 'appel': return Phone;
      case 'email': return Mail;
      case 'rencontre': return Users;
      default: return MessageCircle;
    }
  };

  const getTypeColor = (type: Note['type']) => {
    switch (type) {
      case 'appel': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20';
      case 'email': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20';
      case 'rencontre': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20';
      default: return 'text-sage-600 bg-sage-100 dark:text-sage-400 dark:bg-sage-500/20';
    }
  };

  const getSentimentColor = (sentiment: Note['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'border-l-emerald-500';
      case 'needs-attention': return 'border-l-amber-500';
      default: return 'border-l-gray-400 dark:border-l-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const sortedNotes = [...notes].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Fil de mémoire</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Votre historique d'interactions et notes</p>
      </div>

      {/* Chronologie */}
      <div className="space-y-4 sm:space-y-6">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune mémoire pour le moment</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
              Commencez à ajouter des notes sur vos interactions pour construire votre fil de mémoire
            </p>
          </div>
        ) : (
          sortedNotes.map((note, index) => {
            const TypeIcon = getTypeIcon(note.type);
            const typeColor = getTypeColor(note.type);
            const sentimentColor = getSentimentColor(note.sentiment);
            
            return (
              <div
                key={note.id}
                className={`relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 border-l-4 ${sentimentColor}`}
              >
                {/* Ligne de chronologie */}
                {index < sortedNotes.length - 1 && (
                  <div className="absolute left-6 sm:left-8 -bottom-4 sm:-bottom-6 w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-700" />
                )}
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Icône de type */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* En-tête */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{getContactName(note.contactId)}</h3>
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{note.type}</span>
                          <span>•</span>
                          <span>{formatDate(note.date)}</span>
                        </div>
                      </div>
                      
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 self-start sm:self-auto ${
                        note.sentiment === 'positive' ? 'bg-emerald-500' :
                        note.sentiment === 'needs-attention' ? 'bg-amber-500' :
                        'bg-gray-400 dark:bg-gray-500'
                      }`} />
                    </div>
                    
                    {/* Contenu */}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                      {note.content}
                    </p>
                    
                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {note.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-sage-100 text-sage-700 dark:bg-sage-600/20 dark:text-sage-300 text-xs rounded-full border border-sage-200 dark:border-sage-600/30 truncate max-w-24 sm:max-w-none"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 text-xs rounded-full">
                            +{note.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Timeline;