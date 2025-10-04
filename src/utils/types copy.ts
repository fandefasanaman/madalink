export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  avatar?: string;
  lastContact?: Date;
  nextReminder?: Date;
  tags: string[];
  notes: Note[];
  starred: boolean;
  metAt?: string;
  relationship: string;
  sentiment: 'positive' | 'neutral' | 'needs-attention';
  // Nouvelles propriétés CRM
  customerSince?: Date;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  orderFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'occasional';
  preferredProducts: string[];
  deliveryPreferences: DeliveryPreferences;
  paymentMethod?: 'cash' | 'mvola' | 'orange-money' | 'airtel-money' | 'transfer' | 'check';
  customerStatus: 'active' | 'inactive' | 'prospect';
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryInstructions?: string;
}

export interface DeliveryPreferences {
  preferredDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  preferredTime: 'morning' | 'afternoon' | 'evening';
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  nextDelivery?: Date;
}

export interface Product {
  id: string;
  name: string;
  type: 'milk-kefir' | 'water-kefir' | 'kombucha' | 'cheese' | 'fermented-vegetables' | 'accessories' | string;
  description: string;
  price: number;
  unit: 'liter' | 'piece' | string;
  inStock: number;
  minStock: number;
  image?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  paymentMethod?: 'cash' | 'mvola' | 'orange-money' | 'airtel-money' | 'transfer' | 'check';
  deliveryAddress: Address;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  scheduledDate: Date;
  actualDate?: Date;
  status: 'scheduled' | 'in-progress' | 'delivered' | 'failed';
  address: Address;
  items: OrderItem[];
  deliveryNotes?: string;
  route?: string;
}

export interface Note {
  id: string;
  contactId: string;
  content: string;
  date: Date;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'needs-attention';
  type: 'note' | 'appel' | 'rencontre' | 'email' | 'order' | 'delivery' | 'complaint';
}

export interface Reminder {
  id: string;
  contactId: string;
  contactName: string;
  message: string;
  date: Date;
  completed: boolean;
  type: 'follow-up' | 'delivery' | 'payment' | 'reorder' | 'general';
}

export interface Analytics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  activeCustomers: number;
  averageOrderValue: number;
  topProducts: { productId: string; productName: string; quantity: number; revenue: number }[];
  topCustomers: { customerId: string; customerName: string; totalSpent: number; orderCount: number }[];
  deliveryStats: {
    onTime: number;
    delayed: number;
    failed: number;
  };
}