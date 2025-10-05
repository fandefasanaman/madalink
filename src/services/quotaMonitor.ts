interface QuotaLimits {
  dailyLinks: number;
  dailyTorrents: number;
  maxFileSize: number; // en MB
}

interface UserQuota {
  linksUsed: number;
  torrentsUsed: number;
  lastReset: string;
}

class QuotaMonitor {
  private quotaLimits: Record<string, QuotaLimits> = {
    free: { dailyLinks: 2, dailyTorrents: 1, maxFileSize: 100 },
    bronze: { dailyLinks: 10, dailyTorrents: 2, maxFileSize: 500 },
    silver: { dailyLinks: 50, dailyTorrents: 10, maxFileSize: 2000 },
    gold: { dailyLinks: -1, dailyTorrents: -1, maxFileSize: -1 } // illimité
  };

  private userQuotas: Map<string, UserQuota> = new Map();

  constructor() {
    this.loadQuotasFromStorage();
    this.startDailyReset();
  }

  private loadQuotasFromStorage(): void {
    const stored = localStorage.getItem('madalink_quotas');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.userQuotas = new Map(Object.entries(data));
      } catch (error) {
        console.error('Erreur lors du chargement des quotas:', error);
      }
    }
  }

  private saveQuotasToStorage(): void {
    const data = Object.fromEntries(this.userQuotas);
    localStorage.setItem('madalink_quotas', JSON.stringify(data));
  }

  private startDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetAllQuotas();
      setInterval(() => this.resetAllQuotas(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  private resetAllQuotas(): void {
    const today = new Date().toISOString().split('T')[0];
    
    for (const [userId, quota] of this.userQuotas) {
      this.userQuotas.set(userId, {
        linksUsed: 0,
        torrentsUsed: 0,
        lastReset: today
      });
    }
    
    this.saveQuotasToStorage();
  }

  private getUserQuota(userId: string): UserQuota {
    const today = new Date().toISOString().split('T')[0];
    let quota = this.userQuotas.get(userId);
    
    if (!quota || quota.lastReset !== today) {
      quota = {
        linksUsed: 0,
        torrentsUsed: 0,
        lastReset: today
      };
      this.userQuotas.set(userId, quota);
      this.saveQuotasToStorage();
    }
    
    return quota;
  }

  canUnlockLink(userId: string, userPlan: string): boolean {
    const limits = this.quotaLimits[userPlan] || this.quotaLimits.free;
    if (limits.dailyLinks === -1) return true; // illimité
    
    const quota = this.getUserQuota(userId);
    return quota.linksUsed < limits.dailyLinks;
  }

  canAddTorrent(userId: string, userPlan: string): boolean {
    const limits = this.quotaLimits[userPlan] || this.quotaLimits.free;
    if (limits.dailyTorrents === -1) return true; // illimité
    
    const quota = this.getUserQuota(userId);
    return quota.torrentsUsed < limits.dailyTorrents;
  }

  canDownloadFileSize(userPlan: string, fileSizeMB: number): boolean {
    const limits = this.quotaLimits[userPlan] || this.quotaLimits.free;
    if (limits.maxFileSize === -1) return true; // illimité
    
    return fileSizeMB <= limits.maxFileSize;
  }

  recordLinkUnlock(userId: string): void {
    const quota = this.getUserQuota(userId);
    quota.linksUsed++;
    this.userQuotas.set(userId, quota);
    this.saveQuotasToStorage();
  }

  recordTorrentAdd(userId: string): void {
    const quota = this.getUserQuota(userId);
    quota.torrentsUsed++;
    this.userQuotas.set(userId, quota);
    this.saveQuotasToStorage();
  }

  getQuotaStatus(userId: string, userPlan: string): {
    linksRemaining: number;
    torrentsRemaining: number;
    linksUsed: number;
    torrentsUsed: number;
  } {
    const limits = this.quotaLimits[userPlan] || this.quotaLimits.free;
    const quota = this.getUserQuota(userId);
    
    return {
      linksRemaining: limits.dailyLinks === -1 ? -1 : Math.max(0, limits.dailyLinks - quota.linksUsed),
      torrentsRemaining: limits.dailyTorrents === -1 ? -1 : Math.max(0, limits.dailyTorrents - quota.torrentsUsed),
      linksUsed: quota.linksUsed,
      torrentsUsed: quota.torrentsUsed
    };
  }

  getPlanLimits(userPlan: string): QuotaLimits {
    return this.quotaLimits[userPlan] || this.quotaLimits.free;
  }
}

export default QuotaMonitor;