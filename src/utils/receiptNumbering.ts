// Service de numérotation automatique des reçus
export class ReceiptNumberingService {
  private static readonly STORAGE_KEY = 'receipt-counter';
  private static readonly PREFIX = 'REC';

  // Obtenir le prochain numéro de reçu
  static getNextReceiptNumber(): string {
    const currentYear = new Date().getFullYear();
    const counter = this.getCurrentCounter();
    const nextCounter = counter + 1;
    
    // Sauvegarder le nouveau compteur
    this.saveCounter(nextCounter);
    
    // Formater le numéro avec padding de 3 chiffres
    const formattedNumber = nextCounter.toString().padStart(3, '0');
    
    return `${this.PREFIX} ${formattedNumber}-${currentYear}`;
  }

  // Obtenir le compteur actuel
  private static getCurrentCounter(): number {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Erreur lecture compteur reçu:', error);
      return 0;
    }
  }

  // Sauvegarder le compteur
  private static saveCounter(counter: number): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, counter.toString());
    } catch (error) {
      console.error('Erreur sauvegarde compteur reçu:', error);
    }
  }

  // Réinitialiser le compteur (pour les tests ou nouvelle année)
  static resetCounter(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Obtenir le prochain numéro sans l'incrémenter (pour prévisualisation)
  static previewNextReceiptNumber(): string {
    const currentYear = new Date().getFullYear();
    const counter = this.getCurrentCounter();
    const nextCounter = counter + 1;
    const formattedNumber = nextCounter.toString().padStart(3, '0');
    
    return `${this.PREFIX} ${formattedNumber}-${currentYear}`;
  }
}