import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  contactsService,
  productsService,
  ordersService,
  notesService,
  remindersService,
  vendorInfoService
} from '../services/firebaseService';
import { Contact, Product, Order, Note, Reminder } from '../utils/types';
import { VendorInfo } from '../components/VendorSettings';

export const useFirebaseData = () => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
    nif: '',
    stat: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Fonction de validation des données de commande
  const validateOrderData = (order: Order): Order => {
    console.log('🔍 Validating order data:', {
      orderId: order.id,
      hasItems: !!order.items,
      isArray: Array.isArray(order.items),
      itemsLength: order.items ? order.items.length : 0,
      totalAmount: order.totalAmount,
      rawItems: order.items
    });

    // Fonction helper pour normaliser les items en tableau
    const normalizeItems = (items: any) => {
      if (!items) {
        console.log('📝 No items found, returning empty array');
        return [];
      }
      
      if (Array.isArray(items)) {
        console.log('✅ Items already an array:', items.length);
        return items;
      }
      
      if (typeof items === 'object') {
        // Convertir objet Firebase en tableau en préservant l'ordre des clés numériques
        const keys = Object.keys(items).sort((a, b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          return isNaN(numA) || isNaN(numB) ? 0 : numA - numB;
        });
        
        const convertedArray = keys.map(key => items[key]).filter(item => item != null);
        
        console.log('🔄 Converting Firebase object to array:', {
          orderId: order.id,
          originalKeys: Object.keys(items),
          sortedKeys: keys,
          convertedLength: convertedArray.length,
          originalObject: items,
          convertedArray
        });
        
        return convertedArray;
      }
      
      console.warn('⚠️ Items is neither array nor object, returning empty array:', {
        orderId: order.id,
        itemsType: typeof items,
        items
      });
      return [];
    };

    // Normaliser les items
    order.items = normalizeItems(order.items);

    // Valider chaque item
    order.items = order.items.map((item, index) => {
      if (!item.productName || !item.quantity || !item.unitPrice) {
        console.warn(`⚠️ Invalid item at index ${index}:`, item);
        return {
          productId: item.productId || 'unknown',
          productName: item.productName || 'Article inconnu',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || (item.quantity || 1) * (item.unitPrice || 0)
        };
      }
      return item;
    });

    console.log('✅ Order validation completed:', {
      orderId: order.id,
      validItemsCount: order.items.length,
      totalAmount: order.totalAmount,
      itemsTotal: order.items.reduce((sum, item) => sum + item.totalPrice, 0)
    });

    return order;
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log('🔥 Setting up Firebase real-time listeners for user:', currentUser.uid);
    setConnectionStatus('connecting');

    const unsubscribes: (() => void)[] = [];

    try {
      // Contacts listener
      const unsubscribeContacts = contactsService.onSnapshot((data) => {
        console.log('📋 Contacts updated:', data.length);
        setContacts(data);
      }, currentUser.uid);
      unsubscribes.push(unsubscribeContacts);

      // Products listener
      const unsubscribeProducts = productsService.onSnapshot((data) => {
        console.log('📦 Products updated:', data.length);
        setProducts(data);
      }, currentUser.uid);
      unsubscribes.push(unsubscribeProducts);

      // Orders listener with validation
      const unsubscribeOrders = ordersService.onSnapshot((data) => {
        console.log('🛒 Orders updated:', data.length);
        
        // Valider et corriger chaque commande
        const validatedOrders = data.map(validateOrderData);
        
        console.log('✅ Orders validation completed:', {
          originalCount: data.length,
          validatedCount: validatedOrders.length,
          ordersWithItems: validatedOrders.filter(o => o.items && o.items.length > 0).length,
          ordersWithoutItems: validatedOrders.filter(o => !o.items || o.items.length === 0).length
        });
        
        setOrders(validatedOrders);
      }, currentUser.uid);
      unsubscribes.push(unsubscribeOrders);

      // Notes listener
      const unsubscribeNotes = notesService.onSnapshot((data) => {
        console.log('📝 Notes updated:', data.length);
        setNotes(data);
      }, currentUser.uid);
      unsubscribes.push(unsubscribeNotes);

      // Reminders listener
      const unsubscribeReminders = remindersService.onSnapshot((data) => {
        console.log('⏰ Reminders updated:', data.length);
        setReminders(data);
      }, currentUser.uid);
      unsubscribes.push(unsubscribeReminders);

      // Load vendor info
      vendorInfoService.get(currentUser.uid)
        .then((data) => {
          if (data) {
            console.log('🏢 Vendor info loaded');
            setVendorInfo(data);
          }
        })
        .catch((err) => {
          console.error('❌ Error loading vendor info:', err);
        });

      setConnectionStatus('connected');
      setLoading(false);
      setError(null);

    } catch (err) {
      console.error('❌ Firebase setup error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion Firebase');
      setConnectionStatus('disconnected');
      setLoading(false);
    }

    return () => {
      console.log('🔥 Cleaning up Firebase listeners');
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  // CRUD operations with validation
  const addContact = async (contact: Omit<Contact, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return contactsService.add(contact, currentUser.uid);
  };

  const updateContact = async (id: string, contact: Partial<Contact>) => {
    return contactsService.update(id, contact);
  };

  const deleteContact = async (id: string) => {
    return contactsService.delete(id);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return productsService.add(product, currentUser.uid);
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    return productsService.update(id, product);
  };

  const deleteProduct = async (id: string) => {
    return productsService.delete(id);
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    console.log('🚀 Adding new order with items:', {
      customerId: order.customerId,
      customerName: order.customerName,
      itemsCount: order.items ? order.items.length : 0,
      items: order.items,
      totalAmount: order.totalAmount
    });
    
    // Valider les items avant sauvegarde
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('Une commande doit contenir au moins un article');
    }
    
    // Valider chaque item
    order.items.forEach((item, index) => {
      if (!item.productId || !item.productName || !item.quantity || !item.unitPrice) {
        throw new Error(`Article ${index + 1} invalide: données manquantes`);
      }
    });
    
    return ordersService.add(order, currentUser.uid);
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    console.log('🔄 Updating order:', {
      orderId: id,
      updates: order,
      hasItems: !!order.items,
      itemsCount: order.items ? order.items.length : 0
    });
    
    return ordersService.update(id, order);
  };

  const addNote = async (note: Omit<Note, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return notesService.add(note, currentUser.uid);
  };

  const updateReminder = async (id: string, reminder: Partial<Reminder>) => {
    return remindersService.update(id, reminder);
  };

  const saveVendorInfo = async (info: VendorInfo) => {
    if (!currentUser) throw new Error('User not authenticated');
    await vendorInfoService.set(info, currentUser.uid);
    setVendorInfo(info);
  };

  return {
    contacts,
    products,
    orders,
    notes,
    reminders,
    vendorInfo,
    loading,
    error,
    connectionStatus,
    addContact,
    updateContact,
    deleteContact,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    addNote,
    updateReminder,
    saveVendorInfo
  };
};