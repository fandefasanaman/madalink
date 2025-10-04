import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../utils/types';
import { VendorInfo } from '../components/VendorSettings';

export interface PDFExportOptions {
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

export class PDFService {
  private formatCurrency(amount: number): string {
    if (!amount || isNaN(amount)) return '0 Ar';
    
    // Convertir en nombre entier et formater avec des espaces pour les milliers
    const nombre = parseInt(amount.toString());
    const formatted = nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + ' Ar';
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'mvola': return 'MVola';
      case 'orange-money': return 'Orange Money';
      case 'airtel-money': return 'Airtel Money';
      case 'cash': return 'Espèces';
      case 'transfer': return 'Virement bancaire';
      case 'check': return 'Chèque';
      default: return method;
    }
  }

  // Générer un reçu PDF
  async generateReceiptPDF(order: Order, vendorInfo: VendorInfo, options: PDFExportOptions = {}): Promise<Blob> {
    console.log('📄 Generating PDF receipt for order:', order.id);
    
    const {
      format = 'a4',
      orientation = 'portrait',
      quality = 1.0
    } = options;

    // Créer un nouveau document PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Configuration des couleurs
    const primaryColor = [123, 137, 111]; // Sage-600
    const secondaryColor = [107, 114, 128]; // Gray-500
    const textColor = [17, 24, 39]; // Gray-900

    // Marges et dimensions
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    
    let currentY = margin;

    // En-tête de l'entreprise
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(vendorInfo.name, pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reçu de vente électronique', pageWidth / 2, 30, { align: 'center' });
    
    currentY = 50;

    // Informations du reçu
    pdf.setTextColor(...textColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REÇU DE VENTE', margin, currentY);
    
    currentY += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Informations de base
    const receiptInfo = [
      [`Numéro de reçu:`, order.receiptNumber || `REC-${order.id.toUpperCase()}`],
      [`Date d'émission:`, this.formatDate(new Date())],
      [`Date de commande:`, this.formatDate(order.orderDate)],
      [`Statut du paiement:`, order.paymentStatus === 'paid' ? 'Payé' : 'En attente']
    ];

    receiptInfo.forEach(([label, value]) => {
      pdf.text(label, margin, currentY);
      pdf.text(value, margin + 50, currentY);
      currentY += 6;
    });

    currentY += 5;

    // Informations client
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMATIONS CLIENT', margin, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(order.customerName, margin, currentY);
    currentY += 5;
    
    // Ajouter le téléphone du client s'il est disponible
    if (order.customerPhone) {
      pdf.text(`Tél: ${order.customerPhone}`, margin, currentY);
      currentY += 5;
    }
    
    if (order.deliveryAddress) {
      pdf.text(order.deliveryAddress.street, margin, currentY);
      currentY += 5;
      pdf.text(`${order.deliveryAddress.postalCode} ${order.deliveryAddress.city}`, margin, currentY);
      currentY += 5;
      pdf.text(order.deliveryAddress.country, margin, currentY);
      currentY += 5;
    }

    currentY += 10;

    // Tableau des articles
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DÉTAIL DE LA COMMANDE', margin, currentY);
    currentY += 10;

    // En-tête du tableau
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    // Largeurs optimisées pour éviter le débordement
    const col1Width = contentWidth * 0.35; // 35% pour Article
    const col2Width = contentWidth * 0.12; // 12% pour Qté
    const col3Width = contentWidth * 0.26; // 26% pour Prix unit.
    const col4Width = contentWidth * 0.27; // 27% pour Total
    
    pdf.text('Article', margin + 2, currentY);
    pdf.text('Qté', margin + col1Width + (col2Width / 2), currentY, { align: 'center' });
    pdf.text('Prix unit.', margin + col1Width + col2Width + col3Width - 5, currentY, { align: 'right' });
    pdf.text('Total', margin + contentWidth - 5, currentY, { align: 'right' });
    
    currentY += 8;

    // Articles
    pdf.setFont('helvetica', 'normal');
    console.log('🔍 PDF Service - Analyzing order items:', {
      orderId: order.id,
      hasItems: !!order.items,
      isArray: Array.isArray(order.items),
      itemsLength: order.items ? order.items.length : 0,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee
    });
    
    const orderItems = order.items && Array.isArray(order.items) ? order.items : [];
    
    if (orderItems.length === 0) {
      pdf.setTextColor(255, 0, 0); // Rouge pour signaler le problème
      pdf.text('⚠️ PROBLÈME: Articles manquants', margin + 2, currentY);
      currentY += 6;
      pdf.text(`Total: ${this.formatCurrency(order.totalAmount)} mais aucun article`, margin + 2, currentY);
      currentY += 6;
      pdf.setTextColor(...textColor); // Remettre la couleur normale
    } else {
      console.log('✅ PDF Service - Rendering', orderItems.length, 'items');
      orderItems.forEach((item, index) => {
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margin;
      }

      // Ligne alternée
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, currentY - 3, contentWidth, 6, 'F');
      }

      // Utiliser les largeurs optimisées et formatage corrigé
      pdf.setFontSize(9);
      pdf.text(item.productName, margin + 2, currentY);
      pdf.text(item.quantity.toString(), margin + col1Width + (col2Width / 2), currentY, { align: 'center' });
      pdf.text(this.formatCurrency(item.unitPrice), margin + col1Width + col2Width + col3Width - 5, currentY, { align: 'right' });
      pdf.text(this.formatCurrency(item.totalPrice), margin + contentWidth - 5, currentY, { align: 'right' });
      
      currentY += 6;
      });
    }

    // Frais de livraison
    if (order.deliveryFee && order.deliveryFee > 0) {
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY - 2, margin + contentWidth, currentY - 2);
      
      currentY += 2;
      pdf.setFontSize(9);
      pdf.text('Frais de livraison', margin + 2, currentY);
      pdf.text('1', margin + col1Width + (col2Width / 2), currentY, { align: 'center' });
      pdf.text(this.formatCurrency(order.deliveryFee), margin + col1Width + col2Width + col3Width - 5, currentY, { align: 'right' });
      pdf.text(this.formatCurrency(order.deliveryFee), margin + contentWidth - 5, currentY, { align: 'right' });
      
      currentY += 6;
    }

    // Total
    currentY += 5;
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(1);
    pdf.line(margin, currentY - 2, margin + contentWidth, currentY - 2);
    
    currentY += 5;
    pdf.setFillColor(...primaryColor);
    pdf.rect(margin, currentY - 4, contentWidth, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL GÉNÉRAL', margin + 8, currentY + 3);
    pdf.text(this.formatCurrency(order.totalAmount), margin + contentWidth - 10, currentY + 3, { align: 'right' });
    
    currentY += 20;

    // Informations de paiement
    pdf.setTextColor(...textColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const paymentInfo = [
      [`Méthode de paiement:`, this.getPaymentMethodLabel(order.paymentMethod || 'cash')],
      [`Statut:`, order.paymentStatus === 'paid' ? 'Payé' : 'En attente de paiement']
    ];

    if (order.deliveryDate) {
      paymentInfo.push([`Livraison prévue:`, this.formatDate(order.deliveryDate)]);
    }

    paymentInfo.forEach(([label, value]) => {
      pdf.text(`${label} ${value}`, margin, currentY);
      currentY += 5;
    });

    // Notes
    if (order.notes) {
      currentY += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('NOTES:', margin, currentY);
      currentY += 5;
      pdf.setFont('helvetica', 'normal');
      
      // Diviser les notes en lignes si nécessaire
      const noteLines = pdf.splitTextToSize(order.notes, contentWidth - 10);
      noteLines.forEach((line: string) => {
        pdf.text(line, margin, currentY);
        currentY += 5;
      });
    }

    // Footer
    currentY = pageHeight - 30;
    pdf.setFontSize(8);
    pdf.setTextColor(...secondaryColor);
    pdf.text('Merci pour votre confiance !', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
    pdf.text('Ce reçu électronique fait foi de votre achat', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 8;
    pdf.text(vendorInfo.address, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
    pdf.text(`Tél: ${vendorInfo.phone} | Email: ${vendorInfo.email}`, pageWidth / 2, currentY, { align: 'center' });
    
    if (vendorInfo.nif || vendorInfo.stat) {
      currentY += 4;
      const legalInfo = [];
      if (vendorInfo.nif) legalInfo.push(`NIF: ${vendorInfo.nif}`);
      if (vendorInfo.stat) legalInfo.push(`STAT: ${vendorInfo.stat}`);
      pdf.text(legalInfo.join(' | '), pageWidth / 2, currentY, { align: 'center' });
    }

    console.log('✅ PDF receipt generated successfully');
    return pdf.output('blob');
  }

  // Télécharger le PDF
  async downloadReceiptPDF(order: Order, vendorInfo: VendorInfo, options: PDFExportOptions = {}): Promise<void> {
    try {
      const pdfBlob = await this.generateReceiptPDF(order, vendorInfo, options);
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recu-commande-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('📥 PDF receipt downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading PDF receipt:', error);
      throw error;
    }
  }

  // Ouvrir le PDF dans un nouvel onglet
  async openReceiptPDF(order: Order, vendorInfo: VendorInfo, options: PDFExportOptions = {}): Promise<void> {
    try {
      const pdfBlob = await this.generateReceiptPDF(order, vendorInfo, options);
      const url = URL.createObjectURL(pdfBlob);
      
      window.open(url, '_blank');
      
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('🔗 PDF receipt opened in new tab');
    } catch (error) {
      console.error('❌ Error opening PDF receipt:', error);
      throw error;
    }
  }

  // Imprimer le PDF
  async printReceiptPDF(order: Order, vendorInfo: VendorInfo, options: PDFExportOptions = {}): Promise<void> {
    try {
      const pdfBlob = await this.generateReceiptPDF(order, vendorInfo, options);
      const url = URL.createObjectURL(pdfBlob);
      
      // Ouvrir le PDF dans un nouvel onglet et déclencher l'impression
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          // Attendre que le PDF soit chargé puis imprimer
          setTimeout(() => {
            printWindow.print();
            // Fermer la fenêtre après impression (optionnel)
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          }, 1000);
        };
      } else {
        // Si le popup est bloqué, télécharger le PDF à la place
        console.warn('⚠️ Popup blocked, downloading PDF instead');
        const link = document.createElement('a');
        link.href = url;
        link.download = `recu-commande-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      
      console.log('🖨️ PDF receipt sent to printer');
    } catch (error) {
      console.error('❌ Error printing PDF receipt:', error);
      throw error;
    }
  }
}

// Instance globale du service PDF
export const pdfService = new PDFService();