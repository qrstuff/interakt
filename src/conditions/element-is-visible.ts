import type { Condition } from './types';

export class ElementIsVisible implements Condition {
  private selector: string;
  private threshold: number;

  private isVisible: boolean = false;
  private observer?: IntersectionObserver;

  constructor(selector: string, threshold: number = 0.1) {
    this.selector = selector;
    this.threshold = threshold;
  }

  setUp(): void {
    const el = document.querySelector<HTMLElement>(this.selector);
    if (!el) {
      console.warn(`Element with selector "${this.selector}" not found.`);
      return;
    }

    const options: IntersectionObserverInit = {
      root: null,
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      let isVisible = false;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible = true;
        }
      });

      this.isVisible = isVisible;
    }, options);

    this.observer.observe(el);
  }

  evaluate(): boolean {
    return this.isVisible;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
