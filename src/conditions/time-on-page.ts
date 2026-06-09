import type { Context } from '../context';
import type { Condition } from './types';

export class TimeOnPage implements Condition {
  private nbf: number;

  constructor(nbf: number) {
    this.nbf = nbf;
  }

  evaluate(ctx: Context): boolean {
    return (ctx.duration.page || 0) >= this.nbf;
  }
}
