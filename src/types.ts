import type { Condition } from './conditions/types';
import type { Context, FingerprintConsent } from './context';

export type MaybePromise<T> = T | Promise<T>;

export interface Options {
  conditions: Condition[];
  userId?: string;
  fingerprintConsent?: FingerprintConsent;
  interval?: number;
  delay?: number;
  callback: (ctx: Context) => MaybePromise<void>;
}
