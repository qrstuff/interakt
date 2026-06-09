import type { Condition } from './types';
import type { Context } from '../context';

export class ScrollPosition implements Condition {
  private min?: number;
  private max?: number;
  private unit: 'px' | '%' = '%';

  constructor(min?: number, max?: number, unit: 'px' | '%' = '%') {
    this.min = min;
    this.max = max;
    this.unit = unit;
  }

  evaluate(ctx: Context): boolean {
    const position = this.unit === 'px' ? ctx.scroll.px : ctx.scroll.percent;
    if (this.min !== undefined && position < this.min) {
      return false;
    }
    if (this.max !== undefined && position > this.max) {
      return false;
    }
    return true;
  }
}
