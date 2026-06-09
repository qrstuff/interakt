import type { Condition } from './types';
import type { Context } from '../context';

export class PreviousPage implements Condition {
  private pages: string[];

  constructor(...pages: string[]) {
    this.pages = pages;
  }

  evaluate(ctx: Context): boolean {
    return ctx.history.length > 1 && this.pages.includes(ctx.history[ctx.history.length - 2]);
  }
}
