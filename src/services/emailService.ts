import { Order } from '../utils/types';
import { VendorInfo } from '../components/VendorSettings';
import emailjs from 'emailjs-com';

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  fromName: string;
  fromEmail: string;
  // Garder les anciens champs pour compatibilité
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

export interface EmailLog {
  id: string;
  timestamp: Date;
  to: string;
  subject: string;
  status: 'sending' | 'sent' | 'failed';
  error?: string;
  orderId?: string;
  type?: 'order_confirmed' | 'payment_received';
  details?: any;
  duration?: number;
}

// Service de logging pour les emails
class EmailLogger {
  private logs: EmailLog[] = [];

  log(entry: Omit<EmailLog, 'id' | 'timestamp'>): EmailLog {
    const logEntry: EmailLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...entry
    };
    
    this.logs.unshift(logEntry); // Ajouter au début
    
    // Garder seulement les 100 derniers logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
    
    // Sauvegarder dans localStorage
    this.saveLogs();
    
    // Log dans la console avec plus de détails
    console.group(`📧 Email ${entry.status.toUpperCase()}`);
    console.log('📅 Timestamp:', logEntry.timestamp.toISOString());
    console.log('📮 To:', entry.to);
    console.log('📝 Subject:', entry.subject);
    console.log('📊 Status:', entry.status);
    if (entry.orderId) console.log('🛒 Order ID:', entry.orderId);
    if (entry.type) console.log('🏷️ Type:', entry.type);
    if (entry.duration) console.log('⚡ Duration:', entry.duration + 'ms');
    if (entry.error) console.error('❌ Error:', entry.error);
    if (entry.details) console.log('🔍 Details:', entry.details);
    console.groupEnd();
    
    return logEntry;
  }

  private saveLogs() {
    try {
      localStorage.setItem('email-logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Erreur sauvegarde logs email:', error);
    }
  }

  loadLogs(): EmailLog[] {
    try {
      const saved = localStorage.getItem('email-logs');
      if (saved) {
        this.logs = JSON.parse(saved).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erreur chargement logs email:', error);
      this.logs = [];
    }
    return this.logs;
  }

  getLogs(): EmailLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('email-logs');
  }
}

const emailLogger = new EmailLogger();

export class EmailService {
  public config: EmailConfig;
  private isInitialized: boolean = false;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeEmailJS();
  }

  private initializeEmailJS() {
    try {
      if (this.config.publicKey) {
        // Initialiser EmailJS avec la clé publique - nouvelle méthode
        if (typeof emailjs.init === 'function') {
          emailjs.init(this.config.publicKey);
        } else {
          // Fallback pour les versions plus récentes d'EmailJS
          emailjs.init({
            publicKey: this.config.publicKey
          });
        }
        this.isInitialized = true;
        console.log('✅ EmailJS initialized successfully with public key:', this.config.publicKey.substring(0, 8) + '...');
      } else {
        console.warn('⚠️ EmailJS not initialized - missing public key');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
      this.isInitialized = false;
    }
  }

  // Valider la configuration EmailJS
  private validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config.serviceId) errors.push('Service ID EmailJS manquant');
    if (!this.config.templateId) errors.push('Template ID EmailJS manquant');
    if (!this.config.publicKey) errors.push('Clé publique EmailJS manquante');
    if (!this.config.fromEmail) errors.push('Email expéditeur manquant');
    if (!this.config.fromName) errors.push('Nom expéditeur manquant');
    
    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.config.fromEmail && !emailRegex.test(this.config.fromEmail)) {
      errors.push('Format email expéditeur invalide');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Test de connexion EmailJS
  async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    console.log('🔍 Testing EmailJS connection...');
    
    const validation = this.validateConfig();
    if (!validation.isValid) {
      const error = `Configuration invalide: ${validation.errors.join(', ')}`;
      console.error('❌ EmailJS Test Failed - Invalid config:', validation.errors);
      return { success: false, error, details: { errors: validation.errors } };
    }

    if (!this.isInitialized) {
      this.initializeEmailJS();
    }

    if (!this.isInitialized) {
      const error = 'EmailJS non initialisé';
      console.error('❌ EmailJS not initialized');
      return { success: false, error, details: { initialized: false } };
    }

    try {
      console.log('🔌 Testing EmailJS service connection...');
      
      // Test avec un template vide pour vérifier la connexion
      const testParams = {
        to_email: this.config.fromEmail,
        from_name: this.config.fromName,
        from_email: this.config.fromEmail,
        subject: 'Test de connexion EmailJS',
        order_id: 'TEST',
        customer_name: 'Test Client',
        total_amount: '0 Ar',
        order_date: new Date().toLocaleDateString('fr-FR'),
        items_list: 'Test item',
        payment_method: 'Test',
        payment_status: 'Test',
        delivery_address: 'Test address',
        html_content: '<p>Test de connexion EmailJS</p>',
        text_content: 'Test de connexion EmailJS',
        message: 'Ceci est un test de connexion EmailJS'
      };

      console.log('📤 Sending test email with params:', {
        serviceId: this.config.serviceId,
        templateId: this.config.templateId,
        toEmail: testParams.to_email
      });

      let result;
      try {
        result = await emailjs.send(
          this.config.serviceId,
          this.config.templateId,
          testParams
        );
      } catch (emailjsError: any) {
        console.error('❌ EmailJS send error during test:', emailjsError);
        
        let errorMessage = 'Erreur EmailJS';
        if (emailjsError.status) {
          switch (emailjsError.status) {
            case 400:
              errorMessage = 'Template ou paramètres invalides';
              break;
            case 401:
              errorMessage = 'Clé publique invalide';
              break;
            case 404:
              errorMessage = 'Service ou template introuvable';
              break;
            default:
              errorMessage = `Erreur HTTP ${emailjsError.status}`;
          }
        }
        
        return { 
          success: false, 
          error: errorMessage,
          details: { 
            emailjsError,
            serviceId: this.config.serviceId,
            templateId: this.config.templateId
          }
        };
      }

      console.log('✅ EmailJS test successful:', result);
      return { 
        success: true, 
        details: { 
          status: result.status,
          text: result.text,
          serviceId: this.config.serviceId,
          templateId: this.config.templateId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('❌ EmailJS test failed:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion EmailJS',
        details: { 
          error: error,
          serviceId: this.config.serviceId,
          templateId: this.config.templateId
        }
      };
    }
  }

  // Générer les paramètres pour le template EmailJS
  private generateEmailParams(order: Order, vendorInfo: VendorInfo, recipientEmail: string): any {
    const formatCurrency = (amount: number) => {
      if (!amount || isNaN(amount)) return '0 Ar';
      
      // Convertir en nombre entier et formater avec des espaces pour les milliers
      const nombre = parseInt(amount.toString());
      const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return formatted + ' Ar';
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'mvola': return 'MVola';
        case 'orange-money': return 'Orange Money';
        case 'airtel-money': return 'Airtel Money';
        case 'cash': return 'Espèces';
        case 'transfer': return 'Virement bancaire';
        case 'check': return 'Chèque';
        default: return method;
      }
    };

    // Générer la liste des articles
    const itemsList = (Array.isArray(order.items) ? order.items : [])
      .map(item => `${item.quantity}x ${item.productName} - ${formatCurrency(item.totalPrice)}`)
      .join('\n');

    // Générer le contenu HTML du reçu
    const htmlContent = this.generateReceiptHTML(order, vendorInfo);
    const textContent = this.generateReceiptText(order, vendorInfo);
    return {
      // Destinataire
      to_email: recipientEmail,
      
      // Expéditeur
      from_name: this.config.fromName,
      from_email: this.config.fromEmail,
      
      // Informations de la commande
      order_id: order.id,
      customer_name: order.customerName,
      total_amount: formatCurrency(order.totalAmount),
      order_date: formatDate(order.orderDate),
      delivery_date: order.deliveryDate ? formatDate(order.deliveryDate) : 'Non définie',
      
      // Articles
      items_list: itemsList,
      items_count: (Array.isArray(order.items) ? order.items : []).length,
      
      // Paiement
      payment_method: getPaymentMethodLabel(order.paymentMethod || 'cash'),
      payment_status: order.paymentStatus === 'paid' ? 'Payé' : 'En attente',
      
      // Adresse
      delivery_address: `${order.deliveryAddress.street}, ${order.deliveryAddress.postalCode} ${order.deliveryAddress.city}, ${order.deliveryAddress.country}`,
      delivery_instructions: order.deliveryAddress.deliveryInstructions || '',
      
      // Vendeur
      vendor_name: vendorInfo.name,
      vendor_address: vendorInfo.address,
      vendor_phone: vendorInfo.phone,
      vendor_email: vendorInfo.email,
      vendor_nif: vendorInfo.nif || '',
      vendor_stat: vendorInfo.stat || '',
      
      // Notes
      order_notes: order.notes || '',
      
      // Contenu HTML et texte pour le template
      html_content: htmlContent,
      text_content: textContent,
      
      // Timestamp
      sent_at: formatDate(new Date()),
      
      // Message personnalisé selon le type
      message: 'Voici votre reçu de vente électronique'
    };
  }

  // Envoyer un email via EmailJS
  async sendEmail(templateParams: any, orderId?: string, type?: 'order_confirmed' | 'payment_received'): Promise<boolean> {
    const startTime = Date.now();
    
    // Log début d'envoi
    const logEntry = emailLogger.log({
      to: templateParams.to_email,
      subject: templateParams.subject || `Commande #${orderId}`,
      status: 'sending',
      orderId,
      type,
      details: {
        service: 'EmailJS',
        serviceId: this.config.serviceId,
        templateId: this.config.templateId,
        initialized: this.isInitialized
      }
    });

    console.log('📧 Starting EmailJS send process:', {
      to: templateParams.to_email,
      subject: templateParams.subject,
      orderId,
      type,
      logId: logEntry.id,
      serviceId: this.config.serviceId,
      templateId: this.config.templateId,
      timestamp: new Date().toISOString()
    });

    try {
      // Validation préalable
      const validation = this.validateConfig();
      if (!validation.isValid) {
        const error = `Configuration invalide: ${validation.errors.join(', ')}`;
        const duration = Date.now() - startTime;
        emailLogger.log({
          to: templateParams.to_email,
          subject: templateParams.subject || 'Erreur',
          status: 'failed',
          error,
          orderId,
          type,
          duration,
          details: { validationErrors: validation.errors }
        });
        throw new Error(error);
      }

      // Vérifier l'initialisation
      if (!this.isInitialized) {
        console.log('🔄 Reinitializing EmailJS...');
        this.initializeEmailJS();
        
        if (!this.isInitialized) {
          const error = 'Impossible d\'initialiser EmailJS';
          const duration = Date.now() - startTime;
          emailLogger.log({
            to: templateParams.to_email,
            subject: templateParams.subject || 'Erreur',
            status: 'failed',
            error,
            orderId,
            type,
            duration,
            details: { initializationFailed: true }
          });
          throw new Error(error);
        }
      }

      // Validation du destinataire
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(templateParams.to_email)) {
        const error = 'Adresse email destinataire invalide';
        const duration = Date.now() - startTime;
        emailLogger.log({
          to: templateParams.to_email,
          subject: templateParams.subject || 'Erreur',
          status: 'failed',
          error,
          orderId,
          type,
          duration,
          details: { invalidEmail: templateParams.to_email }
        });
        throw new Error(error);
      }

      console.log('🔍 Email validation passed, preparing EmailJS parameters...');

      console.log('📤 Sending email via EmailJS...', {
        serviceId: this.config.serviceId,
        templateId: this.config.templateId,
        toEmail: templateParams.to_email,
        paramsKeys: Object.keys(templateParams)
      });

      // Envoyer via EmailJS avec gestion d'erreur améliorée
      let result;
      try {
        result = await emailjs.send(
          this.config.serviceId,
          this.config.templateId,
          templateParams
        );
      } catch (emailjsError: any) {
        // Gestion spécifique des erreurs EmailJS
        let errorMessage = 'Erreur EmailJS inconnue';
        
        if (emailjsError.status) {
          switch (emailjsError.status) {
            case 400:
              errorMessage = 'Paramètres invalides ou template introuvable';
              break;
            case 401:
              errorMessage = 'Clé publique invalide ou service non autorisé';
              break;
            case 402:
              errorMessage = 'Quota d\'emails dépassé';
              break;
            case 404:
              errorMessage = 'Service ou template introuvable';
              break;
            case 429:
              errorMessage = 'Trop de requêtes, veuillez patienter';
              break;
            default:
              errorMessage = `Erreur HTTP ${emailjsError.status}: ${emailjsError.text || 'Erreur serveur'}`;
          }
        } else if (emailjsError.text) {
          errorMessage = emailjsError.text;
        } else if (emailjsError.message) {
          errorMessage = emailjsError.message;
        }
        
        const duration = Date.now() - startTime;
        emailLogger.log({
          to: templateParams.to_email,
          subject: templateParams.subject || `Commande #${orderId}`,
          status: 'failed',
          error: errorMessage,
          orderId,
          type,
          duration,
          details: { 
            emailjsError: {
              status: emailjsError.status,
              text: emailjsError.text,
              message: emailjsError.message
            },
            serviceId: this.config.serviceId,
            templateId: this.config.templateId
          }
        });
        
        throw new Error(errorMessage);
      }

      // Succès
      const duration = Date.now() - startTime;
      console.log(`✅ Email sent successfully via EmailJS in ${duration}ms:`, {
        to: templateParams.to_email,
        status: result.status,
        text: result.text,
        orderId
      });
      
      emailLogger.log({
        to: templateParams.to_email,
        subject: templateParams.subject || `Commande #${orderId}`,
        status: 'sent',
        orderId,
        type,
        duration,
        details: { 
          emailjsStatus: result.status,
          emailjsText: result.text,
          serviceId: this.config.serviceId,
          templateId: this.config.templateId
        }
      });
      
      // Stocker dans l'historique simple pour compatibilité
      const emailHistory = JSON.parse(localStorage.getItem('email-history') || '[]');
      emailHistory.push({
        to: templateParams.to_email,
        subject: templateParams.subject || `Commande #${orderId}`,
        sentAt: new Date().toISOString(),
        status: 'sent',
        service: 'EmailJS'
      });
      
      if (emailHistory.length > 50) {
        emailHistory.splice(0, emailHistory.length - 50);
      }
      localStorage.setItem('email-history', JSON.stringify(emailHistory));

      return true;
      
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur inconnue';
      const duration = Date.now() - startTime;
      
      console.error(`❌ EmailJS send failed after ${duration}ms:`, {
        error: errorMessage,
        to: templateParams.to_email,
        orderId,
        serviceId: this.config.serviceId,
        templateId: this.config.templateId,
        stack: error.stack
      });
      
      emailLogger.log({
        to: templateParams.to_email,
        subject: templateParams.subject || `Commande #${orderId}`,
        status: 'failed',
        error: errorMessage,
        orderId,
        type,
        duration,
        details: { 
          errorType: error.constructor.name,
          errorCode: error.code,
          serviceId: this.config.serviceId,
          templateId: this.config.templateId,
          stack: error.stack
        }
      });
      
      return false;
    }
  }

  // Générer le template HTML du reçu
  generateReceiptHTML(order: Order, vendorInfo: VendorInfo): string {
    const formatCurrency = (amount: number) => {
      if (!amount || isNaN(amount)) return '0 Ar';
      
      // Convertir en nombre entier et formater avec des espaces pour les milliers
      const nombre = parseInt(amount.toString());
      const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return formatted + ' Ar';
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'mvola': return 'MVola';
        case 'orange-money': return 'Orange Money';
        case 'airtel-money': return 'Airtel Money';
        case 'cash': return 'Espèces';
        case 'transfer': return 'Virement bancaire';
        case 'check': return 'Chèque';
        default: return method;
      }
    };

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu de vente - ${order.id}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .receipt-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #7B896F, #6B7268);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .receipt-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item h4 {
            margin: 0 0 5px 0;
            color: #7B896F;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-item p {
            margin: 0;
            color: #333;
            font-weight: 500;
        }
        .customer-info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 0 8px 8px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .items-table th {
            background: #7B896F;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }
        .items-table tr:last-child td {
            border-bottom: none;
        }
        .items-table .text-right {
            text-align: right;
        }
        .items-table .text-center {
            text-align: center;
        }
        .total-row {
            background: #f8f9fa;
            font-weight: 600;
            font-size: 16px;
        }
        .total-amount {
            color: #7B896F;
            font-size: 20px;
            font-weight: 700;
        }
        .payment-info {
            background: #e8f5e8;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 0 8px 8px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-paid {
            background: #e8f5e8;
            color: #2e7d32;
        }
        .status-pending {
            background: #fff3e0;
            color: #f57c00;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px;
            }
            .info-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            .items-table th,
            .items-table td {
                padding: 8px;
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>${vendorInfo.name}</h1>
            <p>Reçu de vente électronique</p>
        </div>
        
        <div class="content">
            <div class="receipt-info">
                <div class="info-grid">
                    <div class="info-item">
                        <h4>Numéro de reçu</h4>
                        <p>#${order.id}</p>
                    </div>
                    <div class="info-item">
                        <h4>Date d'émission</h4>
                        <p>${formatDate(new Date())}</p>
                    </div>
                    <div class="info-item">
                        <h4>Date de commande</h4>
                        <p>${formatDate(order.orderDate)}</p>
                    </div>
                    <div class="info-item">
                        <h4>Statut du paiement</h4>
                        <p>
                            <span class="status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
                                ${order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div class="customer-info">
                <h4 style="margin: 0 0 10px 0; color: #1976d2;">Informations client</h4>
                <p style="margin: 0; font-weight: 600;">${order.customerName}</p>
                <p style="margin: 5px 0 0 0; color: #666;">
                    ${order.deliveryAddress.street}<br>
                    ${order.deliveryAddress.postalCode} ${order.deliveryAddress.city}<br>
                    ${order.deliveryAddress.country}
                </p>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Article</th>
                        <th class="text-center">Qté</th>
                        <th class="text-right">Prix unit.</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${(Array.isArray(order.items) ? order.items : []).map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                            <td class="text-right">${formatCurrency(item.totalPrice)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right; padding: 20px 15px;">
                            <strong>TOTAL GÉNÉRAL</strong>
                        </td>
                        <td class="text-right total-amount" style="padding: 20px 15px;">
                            ${formatCurrency(order.totalAmount)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div class="payment-info">
                <h4 style="margin: 0 0 10px 0; color: #2e7d32;">Informations de paiement</h4>
                <p style="margin: 0;"><strong>Méthode :</strong> ${getPaymentMethodLabel(order.paymentMethod || 'cash')}</p>
                <p style="margin: 5px 0 0 0;"><strong>Statut :</strong> ${order.paymentStatus === 'paid' ? 'Payé' : 'En attente de paiement'}</p>
                ${order.deliveryDate ? `<p style="margin: 5px 0 0 0;"><strong>Livraison prévue :</strong> ${formatDate(order.deliveryDate)}</p>` : ''}
            </div>

            ${order.notes ? `
                <div style="background: #f3e5f5; border-left: 4px solid #9c27b0; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #7b1fa2;">Notes</h4>
                    <p style="margin: 0; color: #4a148c;">${order.notes}</p>
                </div>
            ` : ''}
        </div>

        <div class="footer">
            <p><strong>Merci pour votre confiance !</strong></p>
            <p>Ce reçu électronique fait foi de votre achat</p>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
                ${vendorInfo.address}<br>
                Tél: ${vendorInfo.phone} | Email: ${vendorInfo.email}
                ${vendorInfo.nif ? `<br>NIF: ${vendorInfo.nif}` : ''}
                ${vendorInfo.stat ? ` | STAT: ${vendorInfo.stat}` : ''}
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  // Générer le template texte du reçu
  generateReceiptText(order: Order, vendorInfo: VendorInfo): string {
    const formatCurrency = (amount: number) => {
      if (!amount || isNaN(amount)) return '0 Ar';
      
      // Convertir en nombre entier et formater avec des espaces pour les milliers
      const nombre = parseInt(amount.toString());
      const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return formatted + ' Ar';
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    return `
${vendorInfo.name}
REÇU DE VENTE ÉLECTRONIQUE

═══════════════════════════════════════

INFORMATIONS DU REÇU
Numéro: #${order.id}
Date d'émission: ${formatDate(new Date())}
Date de commande: ${formatDate(order.orderDate)}

CLIENT
${order.customerName}
${order.customerPhone ? `Tél: ${order.customerPhone}` : ''}
${order.deliveryAddress.street}
${order.deliveryAddress.postalCode} ${order.deliveryAddress.city}
${order.deliveryAddress.country}

═══════════════════════════════════════

DÉTAIL DE LA COMMANDE

${order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items.map(item => 
  `${item.quantity}x ${item.productName.padEnd(25)} ${formatCurrency(item.totalPrice).padStart(12)}`
).join('\n') : 'Aucun article dans cette commande'}

───────────────────────────────────────
TOTAL GÉNÉRAL${formatCurrency(order.totalAmount).padStart(25)}

═══════════════════════════════════════

PAIEMENT
Méthode: ${order.paymentMethod === 'mvola' ? 'MVola' : 
           order.paymentMethod === 'orange-money' ? 'Orange Money' :
           order.paymentMethod === 'airtel-money' ? 'Airtel Money' :
           order.paymentMethod === 'cash' ? 'Espèces' :
           order.paymentMethod === 'transfer' ? 'Virement' :
           order.paymentMethod === 'check' ? 'Chèque' : order.paymentMethod}
Statut: ${order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
${order.deliveryDate ? `Livraison prévue: ${formatDate(order.deliveryDate)}` : ''}

${order.notes ? `\nNOTES\n${order.notes}\n` : ''}

═══════════════════════════════════════

Merci pour votre confiance !
Ce reçu électronique fait foi de votre achat.

${vendorInfo.address}
Tél: ${vendorInfo.phone} | Email: ${vendorInfo.email}
${vendorInfo.nif ? `NIF: ${vendorInfo.nif}` : ''}${vendorInfo.stat ? ` | STAT: ${vendorInfo.stat}` : ''}
`;
  }

  // Envoyer automatiquement un reçu
  async sendReceiptEmail(order: Order, vendorInfo: VendorInfo, type: 'order_confirmed' | 'payment_received'): Promise<boolean> {
    console.log('🚀 Starting receipt email send process:', {
      orderId: order.id,
      customerName: order.customerName,
      type,
      vendorEmail: vendorInfo.email,
      serviceId: this.config.serviceId,
      templateId: this.config.templateId,
      timestamp: new Date().toISOString()
    });
    
    if (!order.customerName || !vendorInfo.email) {
      const error = 'Informations manquantes pour l\'envoi d\'email';
      console.warn('⚠️', error, {
        hasCustomerName: !!order.customerName,
        hasVendorEmail: !!vendorInfo.email,
        orderId: order.id
      });
      
      emailLogger.log({
        to: vendorInfo.email || 'unknown',
        subject: `Erreur - Commande #${order.id}`,
        status: 'failed',
        error,
        orderId: order.id,
        type,
        details: {
          hasCustomerName: !!order.customerName,
          hasVendorEmail: !!vendorInfo.email
        }
      });
      
      return false;
    }

    // Déterminer l'email du destinataire
    // En production, utiliser l'email du client depuis la base de données
    // Pour la démo, utiliser l'email du vendeur
    const recipientEmail = vendorInfo.email; // TODO: Remplacer par order.customerEmail en production
    
    console.log('📮 Recipient determined:', {
      recipientEmail,
      isDemo: true,
      note: 'En production, utiliser l\'email du client'
    });

    // Générer les paramètres pour EmailJS
    const emailParams = this.generateEmailParams(order, vendorInfo, recipientEmail);
    
    // Ajouter le sujet selon le type
    const isPaymentConfirmation = type === 'payment_received';
    const subject = isPaymentConfirmation 
      ? `✅ Paiement confirmé - Commande #${order.id} - ${vendorInfo.name}`
      : `📋 Commande confirmée #${order.id} - ${vendorInfo.name}`;
    
    // Ajouter le sujet et message aux paramètres
    emailParams.subject = subject;
    emailParams.message = isPaymentConfirmation
      ? `Votre paiement pour la commande #${order.id} a été confirmé. Merci !`
      : `Votre commande #${order.id} a été confirmée. Merci pour votre confiance !`;
    
    console.log('📝 Email parameters generated:', {
      subject,
      paramsCount: Object.keys(emailParams).length,
      type
    });
    
    try {
      const success = await this.sendEmail(emailParams, order.id, type);
      
      if (success) {
        console.log('🎉 Receipt email sent successfully for order:', order.id);
        
        // Déclencher un événement pour notifier l'interface
        window.dispatchEvent(new CustomEvent('email-sent', {
          detail: {
            orderId: order.id,
            customerName: order.customerName,
            type,
            timestamp: new Date()
          }
        }));
      } else {
        console.error('💥 Receipt email send failed for order:', order.id);
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('💥 Exception during receipt email send:', {
        orderId: order.id,
        error: errorMessage,
        type,
        recipientEmail: emailParams.to_email
      });
      return false;
    }
  }

  // Méthodes utilitaires pour les logs
  getLogs(): EmailLog[] {
    return emailLogger.getLogs();
  }

  loadLogs(): EmailLog[] {
    return emailLogger.loadLogs();
  }

  clearLogs(): void {
    emailLogger.clearLogs();
  }

  // Statistiques d'envoi
  getEmailStats(): {
    total: number;
    sent: number;
    failed: number;
    successRate: number;
    lastSent?: Date;
  } {
    const logs = this.getLogs();
    const total = logs.length;
    const sent = logs.filter(log => log.status === 'sent').length;
    const failed = logs.filter(log => log.status === 'failed').length;
    const successRate = total > 0 ? (sent / total) * 100 : 0;
    const lastSentLog = logs.find(log => log.status === 'sent');
    
    return {
      total,
      sent,
      failed,
      successRate,
      lastSent: lastSentLog?.timestamp
    };
  }

  // Mettre à jour la configuration
  updateConfig(newConfig: EmailConfig) {
    this.config = newConfig;
    this.initializeEmailJS();
    console.log('🔧 EmailJS configuration updated:', {
      serviceId: newConfig.serviceId,
      templateId: newConfig.templateId,
      fromEmail: newConfig.fromEmail,
      fromName: newConfig.fromName,
      hasPublicKey: !!newConfig.publicKey
    });
  }
}

// Configuration par défaut EmailJS
export const defaultEmailConfig: EmailConfig = {
  serviceId: 'service_las5s4s',
  templateId: 'template_53t3n1h',
  publicKey: 'FLgkivMEFgFG1TOXa', // Votre clé publique EmailJS
  fromEmail: 'noreply@kefir-madagascar.mg',
  fromName: 'Kéfir Madagascar'
};

// Instance globale du service email
export const emailService = new EmailService(defaultEmailConfig);