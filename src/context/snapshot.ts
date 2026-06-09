import FingerprintJS from '@fingerprintjs/fingerprintjs';
import type { Context } from './types';

export class ContextSnapshot {
  private userId?: string;
  private pageStartTime: Date;

  constructor(userId?: string) {
    this.userId = userId;
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

  private async getUserId(): Promise<string> {
    if (this.userId) {
      return Promise.resolve(this.userId);
    }

    const stored = localStorage.getItem('userId');
    if (stored) {
      this.userId = stored;
      return stored;
    }

    const userId = await FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => result.visitorId);
    localStorage.setItem('userId', userId);
    this.userId = userId;

    return userId;
  }

  async build(): Promise<Context> {
    const now = new Date();
    const scrollableHeight = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const scrollY = window.scrollY || window.pageYOffset;

    return {
      userId: await this.getUserId(),
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
