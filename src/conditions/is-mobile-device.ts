import device from 'current-device';
import type { Condition } from './types';

export class IsMobileDevice implements Condition {
  evaluate(): boolean {
    return device.mobile();
  }
}
