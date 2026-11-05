import type { Context, FingerprintConsent, UserIdSource } from './types';

const VISITOR_ID_KEY = 'userId';

export class ContextSnapshot {
  private userId?: string;
  private fingerprintConsent?: FingerprintConsent;
  private visitorId?: string;
  private pageStartTime: Date;

  constructor(userId?: string, fingerprintConsent?: FingerprintConsent) {
    this.userId = userId;
    this.fingerprintConsent = fingerprintConsent;
    this.pageStartTime = new Date();
    this.addToHistory(window.location.pathname);
  }

  private addToHistory(path: string) {
    const history = this.getHistory();
    if (history[history.length - 1] === path) {
      return;
    }

    history.push(path);
    sessionStorage.setItem('history', JSON.stringify(history));
  }

  private getHistory(): string[] {
    const stored = sessionStorage.getItem('history');
    if (stored) {
      return JSON.parse(stored);
    }

    return [];
  }

  private getPageStartTime(): Date {
    return this.pageStartTime;
  }

  private getSiteStartTime(): Date {
    const stored = sessionStorage.getItem('siteStartTime');
    if (stored) {
      return new Date(stored);
    }

    const now = new Date();
    sessionStorage.setItem('siteStartTime', now.toISOString());
    return now;
  }

  private async hasFingerprintConsent(): Promise<boolean> {
    if (!this.fingerprintConsent) {
      return false;
    }

    try {
      return (await this.fingerprintConsent()) === true;
    } catch {
      return false;
    }
  }

  private async getVisitorId(): Promise<string | null> {
    if (!(await this.hasFingerprintConsent())) {
      this.visitorId = undefined;
      localStorage.removeItem(VISITOR_ID_KEY);
      return null;
    }

    if (this.visitorId) {
      return this.visitorId;
    }

    const stored = localStorage.getItem(VISITOR_ID_KEY);
    if (stored) {
      this.visitorId = stored;
      return stored;
    }

    const { default: FingerprintJS } = await import('@fingerprintjs/fingerprintjs');
    const visitorId = await FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => result.visitorId);
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    this.visitorId = visitorId;

    return visitorId;
  }

  private async getIdentity(): Promise<{ userId: string | null; userIdSource: UserIdSource }> {
    if (this.userId) {
      return { userId: this.userId, userIdSource: 'explicit' };
    }

    const visitorId = await this.getVisitorId();
    if (visitorId) {
      return { userId: visitorId, userIdSource: 'fingerprint' };
    }

    return { userId: null, userIdSource: 'none' };
  }

  async build(): Promise<Context> {
    const now = new Date();
    const scrollableHeight = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const scrollY = window.scrollY || window.pageYOffset;

    return {
      ...(await this.getIdentity()),
      duration: {
        site: now.getTime() - this.getSiteStartTime().getTime(),
        page: now.getTime() - this.getPageStartTime().getTime()
      },
      ts: {
        site: this.getSiteStartTime(),
        page: this.getPageStartTime()
      },
      history: this.getHistory(),
      scroll: {
        px: scrollY,
        percent: (scrollY / scrollableHeight) * 100
      },
      referrer: document.referrer || null
    };
  }
}
