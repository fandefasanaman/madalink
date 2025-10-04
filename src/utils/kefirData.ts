import { Contact, Product, Order, Delivery, Note, Reminder } from './types';

export const kefirProducts: Product[] = [
  {
    id: '1',
    name: 'Kéfir de lait traditionnel',
    type: 'milk-kefir',
    description: 'Kéfir de lait traditionnel, riche en probiotiques naturels',
    price: 9000,
    unit: 'liter',
    inStock: 50,
    minStock: 10
  },
  {
    id: '2',
    name: 'Kéfir de lait au chia',
    type: 'milk-kefir',
    description: 'Kéfir de lait enrichi aux graines de chia',
    price: 11000,
    unit: 'liter',
    inStock: 30,
    minStock: 10
  },
  {
    id: '3',
    name: 'Kombucha nature',
    type: 'kombucha',
    description: 'Kombucha traditionnel non aromatisé',
    price: 6000,
    unit: 'liter',
    inStock: 40,
    minStock: 15
  },
  {
    id: '4',
    name: 'Kombucha aromatisé - Pomme',
    type: 'kombucha',
    description: 'Kombucha saveur pomme',
    price: 9000,
    unit: 'liter',
    inStock: 25,
    minStock: 10
  },
  {
    id: '5',
    name: 'Kombucha aromatisé - Prune',
    type: 'kombucha',
    description: 'Kombucha saveur prune',
    price: 9000,
    unit: 'liter',
    inStock: 20,
    minStock: 8
  },
  {
    id: '6',
    name: 'Kombucha aromatisé - Raketa',
    type: 'kombucha',
    description: 'Kombucha saveur raketa (fruit local)',
    price: 9000,
    unit: 'liter',
    inStock: 18,
    minStock: 8
  },
  {
    id: '7',
    name: 'Kombucha aromatisé - Pokpok',
    type: 'kombucha',
    description: 'Kombucha saveur pokpok (fruit local)',
    price: 9000,
    unit: 'liter',
    inStock: 22,
    minStock: 8
  },
  {
    id: '8',
    name: 'Kombucha aromatisé - Fraise',
    type: 'kombucha',
    description: 'Kombucha saveur fraise',
    price: 9000,
    unit: 'liter',
    inStock: 28,
    minStock: 10
  },
  {
    id: '9',
    name: 'Kombucha aromatisé - Letchis',
    type: 'kombucha',
    description: 'Kombucha saveur letchis',
    price: 9000,
    unit: 'liter',
    inStock: 15,
    minStock: 8
  },
  {
    id: '10',
    name: 'Kombucha aromatisé - Hibiscus',
    type: 'kombucha',
    description: 'Kombucha aux fleurs d\'hibiscus',
    price: 9000,
    unit: 'liter',
    inStock: 20,
    minStock: 8
  },
  {
    id: '11',
    name: 'Kombucha aromatisé - Kaki',
    type: 'kombucha',
    description: 'Kombucha saveur kaki',
    price: 9000,
    unit: 'liter',
    inStock: 16,
    minStock: 8
  },
  {
    id: '12',
    name: 'Kéfir de fruits',
    type: 'water-kefir',
    description: 'Kéfir de fruits rafraîchissant',
    price: 6000,
    unit: 'liter',
    inStock: 35,
    minStock: 12
  },
  {
    id: '13',
    name: 'Fromage de kéfir 100g',
    type: 'cheese',
    description: 'Fromage frais à base de kéfir - format 100g',
    price: 6000,
    unit: 'piece',
    inStock: 40,
    minStock: 15
  },
  {
    id: '14',
    name: 'Fromage de kéfir 200g',
    type: 'cheese',
    description: 'Fromage frais à base de kéfir - format 200g',
    price: 12000,
    unit: 'piece',
    inStock: 25,
    minStock: 10
  },
  {
    id: '15',
    name: 'Graines de chia 250g',
    type: 'accessories',
    description: 'Graines de chia premium - sachet de 250g',
    price: 20000,
    unit: 'piece',
    inStock: 20,
    minStock: 5
  },
  {
    id: '16',
    name: 'Légumes lactofermentés',
    type: 'fermented-vegetables',
    description: 'Légumes fermentés traditionnels en pot',
    price: 10000,
    unit: 'piece',
    inStock: 30,
    minStock: 8
  }
];

export const kefirCustomers: Contact[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '+261 32 12 345 67',
    address: {
      street: '15 rue des Lilas',
      city: 'Antananarivo',
      postalCode: '101',
      country: 'Madagascar',
      deliveryInstructions: 'Laisser devant la porte si absent'
    },
    tags: ['client-fidèle', 'kéfir-lait', 'livraison-hebdomadaire'],
    notes: [],
    starred: true,
    relationship: 'Cliente fidèle',
    sentiment: 'positive',
    customerSince: new Date('2023-03-15'),
    totalSpent: 470000,
    averageOrderValue: 37000,
    lastOrderDate: new Date('2024-01-08'),
    orderFrequency: 'weekly',
    preferredProducts: ['1', '2'],
    deliveryPreferences: {
      preferredDay: 'saturday',
      preferredTime: 'morning',
      frequency: 'weekly',
      nextDelivery: new Date('2024-01-13')
    },
    paymentMethod: 'card',
    customerStatus: 'active'
  },
  {
    id: '2',
    name: 'Pierre Martin',
    email: 'p.martin@gmail.com',
    phone: '+261 33 98 765 43',
    address: {
      street: '42 avenue de la République',
      city: 'Fianarantsoa',
      postalCode: '301',
      country: 'Madagascar'
    },
    tags: ['nouveau-client', 'kéfir-eau', 'bio'],
    notes: [],
    starred: false,
    relationship: 'Nouveau client',
    sentiment: 'positive',
    customerSince: new Date('2024-01-05'),
    totalSpent: 64000,
    averageOrderValue: 32000,
    lastOrderDate: new Date('2024-01-05'),
    orderFrequency: 'bi-weekly',
    preferredProducts: ['3', '4'],
    deliveryPreferences: {
      preferredDay: 'wednesday',
      preferredTime: 'evening',
      frequency: 'bi-weekly',
      nextDelivery: new Date('2024-01-17')
    },
    paymentMethod: 'transfer',
    customerStatus: 'active'
  },
  {
    id: '4',
    name: 'Jean Rakoto',
    email: 'jean.rakoto@email.mg',
    phone: '+261 34 56 789 01',
    address: {
      street: '25 rue Rainandriamampandry',
      city: 'Antananarivo',
      postalCode: '101',
      country: 'Madagascar',
      deliveryInstructions: 'Appeler avant livraison'
    },
    tags: ['client-régulier', 'kombucha', 'paiement-mobile'],
    notes: [],
    starred: false,
    relationship: 'Client régulier',
    sentiment: 'positive',
    customerSince: new Date('2023-09-10'),
    totalSpent: 234000,
    averageOrderValue: 18000,
    lastOrderDate: new Date(),
    orderFrequency: 'weekly',
    preferredProducts: ['3', '4', '5'],
    deliveryPreferences: {
      preferredDay: 'tuesday',
      preferredTime: 'afternoon',
      frequency: 'weekly',
      nextDelivery: new Date('2024-01-16')
    },
    paymentMethod: 'mvola',
    customerStatus: 'active',
    userId: 'demo-user',
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Sophie Leroy',
    email: 'sophie.leroy@outlook.fr',
    phone: '+261 34 11 223 34',
    address: {
      street: '8 place Bellecour',
      city: 'Toamasina',
      postalCode: '501',
      country: 'Madagascar',
      deliveryInstructions: 'Sonner à l\'interphone - Apt 3B'
    },
    tags: ['client-premium', 'commandes-importantes', 'événements'],
    notes: [],
    starred: true,
    relationship: 'Cliente premium',
    sentiment: 'positive',
    customerSince: new Date('2023-06-20'),
    totalSpent: 913500,
    averageOrderValue: 76125,
    lastOrderDate: new Date('2024-01-06'),
    orderFrequency: 'weekly',
    preferredProducts: ['1', '2', '3', '5'],
    deliveryPreferences: {
      preferredDay: 'friday',
      preferredTime: 'afternoon',
      frequency: 'weekly',
      nextDelivery: new Date('2024-01-12')
    },
    paymentMethod: 'orange-money',
    customerStatus: 'active'
  }
]

export const recentOrders: Order[] = [
  {
    id: '1',
    receiptNumber: 'REC 001-2025',
    customerId: '1',
    customerName: 'Marie Dubois',
    customerPhone: '+261 32 12 345 67',
    orderDate: new Date('2024-01-08'),
    deliveryDate: new Date('2024-01-13'),
    status: 'confirmed',
    items: [
      {
        productId: '1',
        productName: 'Kéfir de lait traditionnel',
        quantity: 2,
        unitPrice: 9000,
        totalPrice: 18000
      },
      {
        productId: '3',
        productName: 'Kombucha nature',
        quantity: 2,
        unitPrice: 6000,
        totalPrice: 12000
      }
    ],
    totalAmount: 30000,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    deliveryAddress: {
      street: '15 rue des Lilas',
      city: 'Antananarivo',
      postalCode: '101',
      country: 'Madagascar'
    },
    userId: 'demo-user',
    createdAt: new Date()
  },
  {
    id: '2',
    receiptNumber: 'REC 002-2025',
    customerId: '3',
    customerName: 'Sophie Leroy',
    customerPhone: '+261 34 11 223 34',
    orderDate: new Date('2024-01-06'),
    deliveryDate: new Date(), // Aujourd'hui
    status: 'pending',
    items: [
      {
        productId: '1',
        productName: 'Kéfir de lait traditionnel',
        quantity: 4,
        unitPrice: 9000,
        totalPrice: 36000
      },
      {
        productId: '4',
        productName: 'Kombucha aromatisé - Pomme',
        quantity: 3,
        unitPrice: 9000,
        totalPrice: 27000
      },
      {
        productId: '15',
        productName: 'Graines de chia 250g',
        quantity: 1,
        unitPrice: 20000,
        totalPrice: 20000
      }
    ],
    totalAmount: 83000,
    paymentStatus: 'pending',
    paymentMethod: 'card',
    deliveryAddress: {
      street: '8 place Bellecour',
      city: 'Toamasina',
      postalCode: '501',
      country: 'Madagascar'
    },
    notes: 'Commande pour événement familial',
    userId: 'demo-user',
    createdAt: new Date()
  },
  {
    id: '3',
    receiptNumber: 'REC 003-2025',
    customerId: '2',
    customerName: 'Pierre Martin',
    customerPhone: '+261 33 98 765 43',
    orderDate: new Date(),
    deliveryDate: new Date(), // Aujourd'hui
    status: 'delivered',
    items: [
      {
        productId: '3',
        productName: 'Kombucha nature',
        quantity: 2,
        unitPrice: 6000,
        totalPrice: 12000
      },
      {
        productId: '12',
        productName: 'Kéfir de fruits',
        quantity: 1,
        unitPrice: 6000,
        totalPrice: 6000
      }
    ],
    totalAmount: 18000,
    paymentStatus: 'paid',
    paymentMethod: 'mvola',
    deliveryAddress: {
      street: '42 avenue de la République',
      city: 'Fianarantsoa',
      postalCode: '301',
      country: 'Madagascar'
    },
    userId: 'demo-user',
    createdAt: new Date()
  }
];

export const upcomingDeliveries: Delivery[] = [];

export const businessReminders: Reminder[] = [
  {
    id: '1',
    contactId: '2',
    contactName: 'Pierre Martin',
    message: 'Relancer pour nouvelle commande - client potentiel régulier',
    date: new Date('2024-01-15'),
    completed: false,
    type: 'reorder'
  },
  {
    id: '2',
    contactId: '1',
    contactName: 'Marie Dubois',
    message: 'Vérifier satisfaction après livraison',
    date: new Date('2024-01-14'),
    completed: false,
    type: 'follow-up'
  },
  {
    id: '3',
    contactId: '3',
    contactName: 'Sophie Leroy',
    message: 'Confirmer paiement commande #2',
    date: new Date('2024-01-11'),
    completed: false,
    type: 'payment'
  },
  {
    id: '4',
    contactId: '4',
    contactName: 'Jean Rakoto',
    message: 'Préparer commande hebdomadaire',
    date: new Date(),
    completed: false,
    type: 'delivery',
    userId: 'demo-user',
    createdAt: new Date()
  }
];