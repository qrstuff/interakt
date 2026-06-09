import type { Context } from '../context';
import type { Condition } from './types';

export class TimeOnSite implements Condition {
  private nbf: number;

  constructor(nbf: number) {
    this.nbf = nbf;
  }

  evaluate(ctx: Context): boolean {
    return (ctx.duration.site || 0) >= this.nbf;
  }
}
