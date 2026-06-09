import type { Context } from '../context';
import type { MaybePromise } from '../types';

export interface Condition {
  setUp?: () => MaybePromise<void>;

  evaluate: (ctx: Context) => MaybePromise<boolean>;

  destroy?: () => MaybePromise<void>;
}
