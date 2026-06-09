import type { Condition } from './types';

export class ElementWasClicked implements Condition {
  private selector: string;

  private hasBeenClicked: boolean = false;
  private element?: HTMLElement;
  private handleClick = () => {
    this.hasBeenClicked = true;
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

    this.element.addEventListener('click', this.handleClick);
  }

  evaluate(): boolean {
    return this.hasBeenClicked;
  }

  destroy(): void {
    this.element?.removeEventListener('click', this.handleClick);
    this.element = undefined;
  }
}
