import type { Condition } from './types';

export class ElementWasHovered implements Condition {
  private selector: string;

  private hasBeenHovered = false;
  private element?: HTMLElement;
  private handleMouseEnter = () => {
    this.hasBeenHovered = true;
  };

  constructor(selector: string) {
    this.selector = selector;
  }

  setUp(): void {
    this.element = document.querySelector<HTMLElement>(this.selector) ?? undefined;
    if (!this.element) {
      console.warn(`Element with selector "${this.selector}" not found.`);
      return;
    }

    this.element.addEventListener('mouseenter', this.handleMouseEnter);
  }

  evaluate(): boolean {
    return this.hasBeenHovered;
  }

  destroy(): void {
    this.element?.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element = undefined;
  }
}
