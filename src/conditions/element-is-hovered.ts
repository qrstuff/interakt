import type { Condition } from './types';

export class ElementIsHovered implements Condition {
  private selector: string;

  private isHovered = false;
  private element?: HTMLElement;
  private handleMouseEnter = () => {
    this.isHovered = true;
  };
  private handleMouseLeave = () => {
    this.isHovered = false;
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
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
  }

  evaluate(): boolean {
    return this.isHovered;
  }

  destroy(): void {
    this.element?.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element?.removeEventListener('mouseleave', this.handleMouseLeave);
    this.element = undefined;
    this.isHovered = false;
  }
}
