import type { Condition } from './types';

export class PageExited implements Condition {
  private hasExited: boolean = false;
  private handleMouseLeave = (event: MouseEvent) => {
    if (event.clientY < 5 && !this.hasExited) {
      this.hasExited = true;
    }
  };

  setUp(): void {
    document.addEventListener('mouseleave', this.handleMouseLeave);
  }

  evaluate(): boolean {
    return this.hasExited;
  }

  destroy(): void {
    document.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}
