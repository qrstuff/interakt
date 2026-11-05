import type { Context, FingerprintConsent, UserIdSource } from './types';

const VISITOR_ID_KEY = 'userId';
const HISTORY_KEY = 'history';
const SITE_START_KEY = 'siteStartTime';

export class ContextSnapshot {
  private userId?: string;
  private fingerprintConsent?: FingerprintConsent;
  private storageConsent?: FingerprintConsent;
  private visitorId?: string;
  private pageStartTime: Date;
  private currentPath: string;

  constructor(
    userId?: string,
    fingerprintConsent?: FingerprintConsent,
    storageConsent?: FingerprintConsent
  ) {
    this.userId = userId;
    this.fingerprintConsent = fingerprintConsent;
    this.storageConsent = storageConsent;
    this.pageStartTime = new Date();
    this.currentPath = window.location.pathname;
  }

  private static async granted(check?: FingerprintConsent): Promise<boolean> {
    if (!check) {
      return false;
    }

    try {
      return (await check()) === true;
    } catch {
      return false;
    }
  }

  /** Without a `storageConsent` option, session storage is used as before. */
  private async canUseSessionStorage(): Promise<boolean> {
    if (!this.storageConsent) {
      return true;
    }

    return ContextSnapshot.granted(this.storageConsent);
  }

  private readHistory(): string[] {
    const stored = sessionStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  private getHistory(persist: boolean): string[] {
    if (!persist) {
      return [this.currentPath];
    }

    const history = this.readHistory();
    if (history[history.length - 1] !== this.currentPath) {
      history.push(this.currentPath);
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    return history;
  }

  private getSiteStartTime(persist: boolean): Date {
    if (!persist) {
      return this.pageStartTime;
    }

    const stored = sessionStorage.getItem(SITE_START_KEY);
    if (stored) {
      return new Date(stored);
    }

    sessionStorage.setItem(SITE_START_KEY, this.pageStartTime.toISOString());
    return this.pageStartTime;
  }

  private async getVisitorId(): Promise<string | null> {
    if (!(await ContextSnapshot.granted(this.fingerprintConsent))) {
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
    // `monitoring` is read at runtime but missing from the published typings;
    // false stops FingerprintJS's usage beacon to openfpcdn.io.
    const options: Parameters<typeof FingerprintJS.load>[0] & { monitoring: boolean } = {
      monitoring: false
    };
    const visitorId = await FingerprintJS.load(options)
      .then((fp) => fp.get())
      .then((result) => result.visitorId);
    // Consent can be withdrawn while FingerprintJS runs; never store after that.
    if (!(await ContextSnapshot.granted(this.fingerprintConsent))) {
      return null;
    }
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
    const persist = await this.canUseSessionStorage();
    if (!persist) {
      sessionStorage.removeItem(HISTORY_KEY);
      sessionStorage.removeItem(SITE_START_KEY);
    }
    const siteStart = this.getSiteStartTime(persist);
    const scrollableHeight = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const scrollY = window.scrollY || window.pageYOffset;

    return {
      ...(await this.getIdentity()),
      duration: {
        site: now.getTime() - siteStart.getTime(),
        page: now.getTime() - this.pageStartTime.getTime()
      },
      ts: {
        site: siteStart,
        page: this.pageStartTime
      },
      history: this.getHistory(persist),
      scroll: {
        px: scrollY,
        percent: (scrollY / scrollableHeight) * 100
      },
      referrer: document.referrer || null
    };
  }
}
