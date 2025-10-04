import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { Contact, Product, Order, Note, Reminder } from '../utils/types';

// Logging service for tracking all operations
const logOperation = (operation: string, collection: string, data?: any, error?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    collection,
    success: !error,
    data: data ? JSON.stringify(data, null, 2) : null,
    error: error ? error.message : null
  };
  
  console.group(`🔥 Firebase ${operation} - ${collection}`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`✅ Success: ${!error}`);
  if (data) console.log(`📄 Data:`, data);
  if (error) console.error(`❌ Error:`, error);
  console.groupEnd();
  
  // Store in localStorage for debugging
  const logs = JSON.parse(localStorage.getItem('firebase-logs') || '[]');
  logs.push(logEntry);
  // Keep only last 100 logs
  if (logs.length > 100) logs.shift();
  localStorage.setItem('firebase-logs', JSON.stringify(logs));
  
  // Déclencher un événement personnalisé pour notifier les composants
  window.dispatchEvent(new CustomEvent('firebase-operation', { 
    detail: { operation, collection, success: !error, timestamp } 
  }));
};

// Collections
const COLLECTIONS = {
  CONTACTS: 'contacts',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  NOTES: 'notes',
  REMINDERS: 'reminders',
  VENDOR_INFO: 'vendorInfo'
};

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === 'object') {
      converted[key] = convertTimestamps(converted[key]);
    }
  });
  
  return converted;
};

// Helper function to convert Date objects to Firestore timestamps
const convertDatesToTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    // Remove undefined values to prevent Firestore errors
    if (converted[key] === undefined) {
      delete converted[key];
      return;
    }
    
    if (converted[key] instanceof Date) {
      converted[key] = Timestamp.fromDate(converted[key]);
    } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      converted[key] = convertDatesToTimestamps(converted[key]);
    }
  });
  
  return converted;
};

// Contacts Service
export const contactsService = {
  // Get all contacts
  async getAll(userId?: string): Promise<Contact[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.CONTACTS), ...constraints));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Contact[];
  },

  // Get contact by ID
  async getById(id: string): Promise<Contact | null> {
    const docRef = doc(db, COLLECTIONS.CONTACTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertTimestamps(docSnap.data())
      } as Contact;
    }
    return null;
  },

  // Add new contact
  async add(contact: Omit<Contact, 'id'>, userId: string): Promise<string> {
    console.log('🚀 Starting contact creation...', contact);
    const contactData = convertDatesToTimestamps(contact);
    
    // Ensure required fields have default values
    const completeContactData = {
      ...contactData,
      totalSpent: contactData.totalSpent || 0,
      averageOrderValue: contactData.averageOrderValue || 0,
      preferredProducts: contactData.preferredProducts || [],
      customerStatus: contactData.customerStatus || 'active',
      orderFrequency: contactData.orderFrequency || 'monthly',
      deliveryPreferences: contactData.deliveryPreferences || {
        preferredDay: 'saturday',
        preferredTime: 'morning',
        frequency: 'weekly'
      }
    };
    
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CONTACTS), {
        ...completeContactData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      logOperation('ADD', 'contacts', { id: docRef.id, ...completeContactData });
      return docRef.id;
    } catch (error) {
      logOperation('ADD', 'contacts', completeContactData, error);
      throw error;
    }
  },

  // Update contact
  async update(id: string, contact: Partial<Contact>): Promise<void> {
    console.log('🔄 Starting contact update...', { id, contact });
    const docRef = doc(db, COLLECTIONS.CONTACTS, id);
    const contactData = convertDatesToTimestamps(contact);
    
    // Remove undefined values to avoid Firestore errors
    const cleanContactData = Object.fromEntries(
      Object.entries(contactData).filter(([_, value]) => value !== undefined)
    );
    
    try {
      await updateDoc(docRef, {
        ...cleanContactData,
        updatedAt: serverTimestamp()
      });
      logOperation('UPDATE', 'contacts', { id, ...cleanContactData });
    } catch (error) {
      logOperation('UPDATE', 'contacts', { id, ...cleanContactData }, error);
      throw error;
    }
  },

  // Delete contact
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.CONTACTS, id));
  },

  // Listen to contacts changes
  onSnapshot(callback: (contacts: Contact[]) => void, userId?: string) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(query(collection(db, COLLECTIONS.CONTACTS), ...constraints), (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Contact[];
      callback(contacts);
    });
  }
};

// Products Service
export const productsService = {
  async getAll(userId?: string): Promise<Product[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), ...constraints));
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Product[];
    
    // Sort by createdAt in descending order (newest first)
    return products.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  },

  async add(product: Omit<Product, 'id'>, userId: string): Promise<string> {
    console.log('🚀 Starting product creation...', product);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...product,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      logOperation('ADD', 'products', { id: docRef.id, ...product });
      return docRef.id;
    } catch (error) {
      logOperation('ADD', 'products', product, error);
      throw error;
    }
  },

  async update(id: string, product: Partial<Product>): Promise<void> {
    console.log('🔄 Starting product update...', { id, product });
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    try {
      await updateDoc(docRef, {
        ...product,
        updatedAt: serverTimestamp()
      });
      logOperation('UPDATE', 'products', { id, ...product });
    } catch (error) {
      logOperation('UPDATE', 'products', { id, ...product }, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  },

  onSnapshot(callback: (products: Product[]) => void, userId?: string) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(query(collection(db, COLLECTIONS.PRODUCTS), ...constraints), (snapshot) => {
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Product[];
      
      // Sort by createdAt in descending order (newest first)
      products = products.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      callback(products);
    });
  }
};

// Orders Service
export const ordersService = {
  async getAll(userId?: string): Promise<Order[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.ORDERS), ...constraints)
    );
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Order[];
    
    // Sort by orderDate in descending order (newest first)
    return orders.sort((a, b) => {
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    });
  },

  async add(order: Omit<Order, 'id'>, userId: string): Promise<string> {
    console.log('🚀 Starting order creation...', order);
    const orderData = convertDatesToTimestamps(order);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...orderData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      logOperation('ADD', 'orders', { id: docRef.id, ...orderData });
      return docRef.id;
    } catch (error) {
      logOperation('ADD', 'orders', orderData, error);
      throw error;
    }
  },

  async update(id: string, order: Partial<Order>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    const orderData = convertDatesToTimestamps(order);
    await updateDoc(docRef, {
      ...orderData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.ORDERS, id));
  },

  onSnapshot(callback: (orders: Order[]) => void, userId?: string) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.ORDERS), ...constraints),
      (snapshot) => {
        let orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Order[];
        
        // Sort by orderDate in descending order (newest first)
        orders = orders.sort((a, b) => {
          const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
          const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
          return dateB - dateA;
        });
        
        callback(orders);
      }
    );
  }
};

// Notes Service
export const notesService = {
  async getAll(userId?: string): Promise<Note[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.NOTES), ...constraints)
    );
    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Note[];
    
    // Sort by date in descending order (newest first)
    return notes.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  },

  async add(note: Omit<Note, 'id'>, userId: string): Promise<string> {
    console.log('🚀 Starting note creation...', note);
    const noteData = convertDatesToTimestamps(note);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), {
        ...noteData,
        userId,
        createdAt: serverTimestamp()
      });
      logOperation('ADD', 'notes', { id: docRef.id, contactId: note.contactId });
      return docRef.id;
    } catch (error) {
      logOperation('ADD', 'notes', { contactId: note.contactId }, error);
      throw error;
    }
  },

  async update(id: string, note: Partial<Note>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.NOTES, id);
    const noteData = convertDatesToTimestamps(note);
    await updateDoc(docRef, noteData);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOTES, id));
  },

  onSnapshot(callback: (notes: Note[]) => void, userId?: string) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.NOTES), ...constraints),
      (snapshot) => {
        let notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Note[];
        
        // Sort by date in descending order (newest first)
        notes = notes.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        
        callback(notes);
      }
    );
  }
};

// Reminders Service
export const remindersService = {
  async getAll(userId?: string): Promise<Reminder[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.REMINDERS), ...constraints)
    );
    const reminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Reminder[];
    
    // Sort by date in ascending order (earliest first)
    return reminders.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
  },

  async add(reminder: Omit<Reminder, 'id'>, userId: string): Promise<string> {
    const reminderData = convertDatesToTimestamps(reminder);
    const docRef = await addDoc(collection(db, COLLECTIONS.REMINDERS), {
      ...reminderData,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, reminder: Partial<Reminder>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.REMINDERS, id);
    const reminderData = convertDatesToTimestamps(reminder);
    await updateDoc(docRef, reminderData);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.REMINDERS, id));
  },

  onSnapshot(callback: (reminders: Reminder[]) => void, userId?: string) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.REMINDERS), ...constraints),
      (snapshot) => {
        let reminders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Reminder[];
        
        // Sort by date in ascending order (earliest first)
        reminders = reminders.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        });
        
        callback(reminders);
      }
    );
  }
};

// Vendor Info Service
export const vendorInfoService = {
  async get(userId?: string): Promise<any> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.VENDOR_INFO), ...constraints));
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  },

  async set(vendorInfo: any, userId: string): Promise<void> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.VENDOR_INFO), where('userId', '==', userId))
    );
    
    if (!querySnapshot.empty) {
      // Update existing
      const docRef = doc(db, COLLECTIONS.VENDOR_INFO, querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        ...vendorInfo,
        userId,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new
      await addDoc(collection(db, COLLECTIONS.VENDOR_INFO), {
        ...vendorInfo,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }
};

// Migration Service - to migrate existing data to Firebase
export const migrationService = {
  async migrateAllData(localData: {
    contacts: Contact[];
    products: Product[];
    orders: Order[];
    notes: Note[];
    reminders: Reminder[];
    vendorInfo: any;
  }, userId: string): Promise<void> {
    console.log('🚀 Starting complete data migration...', {
      contactsCount: localData.contacts.length,
      productsCount: localData.products.length,
      ordersCount: localData.orders.length,
      notesCount: localData.notes.length,
      remindersCount: localData.reminders.length
    });
    
    const batch = writeBatch(db);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Migrate contacts
      console.log('📋 Migrating contacts...');
      for (const contact of localData.contacts) {
        const { id, ...contactData } = contact;
        const docRef = doc(collection(db, COLLECTIONS.CONTACTS));
        const dataWithTimestamps = convertDatesToTimestamps(contactData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      }

      // Migrate products
      console.log('📦 Migrating products...');
      for (const product of localData.products) {
        const { id, ...productData } = product;
        const docRef = doc(collection(db, COLLECTIONS.PRODUCTS));
        batch.set(docRef, {
          ...productData,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      }

      // Migrate orders
      console.log('🛒 Migrating orders...');
      for (const order of localData.orders) {
        const { id, ...orderData } = order;
        const docRef = doc(collection(db, COLLECTIONS.ORDERS));
        const dataWithTimestamps = convertDatesToTimestamps(orderData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      }

      // Migrate notes
      console.log('📝 Migrating notes...');
      for (const note of localData.notes) {
        const { id, ...noteData } = note;
        const docRef = doc(collection(db, COLLECTIONS.NOTES));
        const dataWithTimestamps = convertDatesToTimestamps(noteData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp()
        });
        successCount++;
      }

      // Migrate reminders
      console.log('⏰ Migrating reminders...');
      for (const reminder of localData.reminders) {
        const { id, ...reminderData } = reminder;
        const docRef = doc(collection(db, COLLECTIONS.REMINDERS));
        const dataWithTimestamps = convertDatesToTimestamps(reminderData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp()
        });
        successCount++;
      }

      // Migrate vendor info
      console.log('🏢 Migrating vendor info...');
      if (localData.vendorInfo) {
        const docRef = doc(collection(db, COLLECTIONS.VENDOR_INFO));
        batch.set(docRef, {
          ...localData.vendorInfo,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      }

      await batch.commit();
      
      const migrationSummary = {
        totalItems: successCount,
        contacts: localData.contacts.length,
        products: localData.products.length,
        orders: localData.orders.length,
        notes: localData.notes.length,
        reminders: localData.reminders.length
      };
      
      console.log('✅ Migration completed successfully!', migrationSummary);
      logOperation('MIGRATE', 'all-collections', migrationSummary);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      logOperation('MIGRATE', 'all-collections', { successCount, errorCount }, error);
      throw error;
    }
  }
};