import { Contact, Note, Reminder } from './types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    lastContact: new Date('2024-01-10'),
    nextReminder: new Date('2024-01-15'),
    tags: ['ami', 'designer', 'mentor'],
    notes: [],
    starred: true,
    metAt: 'Conférence design 2023',
    relationship: 'Ami proche et mentor',
    sentiment: 'positive'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@startup.com',
    lastContact: new Date('2024-01-08'),
    nextReminder: new Date('2024-01-20'),
    tags: ['collègue', 'startup', 'à-recontacter'],
    notes: [],
    starred: false,
    metAt: 'Meetup tech',
    relationship: 'Contact professionnel',
    sentiment: 'neutral'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma.t@agency.com',
    phone: '+1 (555) 987-6543',
    lastContact: new Date('2024-01-05'),
    nextReminder: new Date('2024-01-18'),
    tags: ['client', 'créatif', 'priorité-haute'],
    notes: [],
    starred: true,
    metAt: 'Référence client',
    relationship: 'Client clé',
    sentiment: 'positive'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david@techcorp.com',
    lastContact: new Date('2024-01-03'),
    tags: ['ex-collègue', 'ingénieur', 'rattrapage-nécessaire'],
    notes: [],
    starred: false,
    metAt: 'Ancienne entreprise',
    relationship: 'Ancien collègue',
    sentiment: 'needs-attention'
  }
];

export const mockNotes: Note[] = [
  {
    id: '1',
    contactId: '1',
    content: 'Excellent café pour discuter de son nouveau travail sur les systèmes de design. Elle a mentionné être intéressée par des opportunités de collaboration.',
    date: new Date('2024-01-10'),
    tags: ['café', 'collaboration', 'systèmes-design'],
    sentiment: 'positive',
    type: 'rencontre'
  },
  {
    id: '2',
    contactId: '2',
    content: 'Appel rapide concernant le pitch de la startup. Il semblait stressé par le financement mais enthousiaste concernant la direction du produit.',
    date: new Date('2024-01-08'),
    tags: ['startup', 'financement', 'produit'],
    sentiment: 'neutral',
    type: 'appel'
  }
];

export const mockReminders: Reminder[] = [
  {
    id: '1',
    contactId: '1',
    contactName: 'Sarah Chen',
    message: 'Faire le suivi du projet de collaboration',
    date: new Date('2024-01-15'),
    completed: false
  },
  {
    id: '2',
    contactId: '3',
    contactName: 'Emma Thompson',
    message: 'Envoyer le brouillon de proposition de projet',
    date: new Date('2024-01-18'),
    completed: false
  },
  {
    id: '3',
    contactId: '4',
    contactName: 'David Park',
    message: 'Programmer un appel de rattrapage',
    date: new Date('2024-01-16'),
    completed: false
  }
];