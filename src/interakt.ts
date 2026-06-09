import type { Options } from './types';
import { ContextSnapshot } from './context';

export class Interakt {
  private readonly conditions: Options['conditions'];
  private readonly userId?: Options['userId'];
  private readonly interval: number;
  private readonly delay?: Options['delay'];
  private readonly callback: Options['callback'];
  private context?: ContextSnapshot;
  private timer1?: ReturnType<typeof setInterval>;
  private timer2?: ReturnType<typeof setTimeout>;
  private isChecking = false;
  private hasTriggered = false;

  constructor(options: Options) {
    this.conditions = options.conditions;
    this.userId = options.userId;
    this.interval = options.interval ?? 250;
    this.delay = options.delay;
    this.callback = options.callback;
  }

  async setUp(): Promise<void> {
    this.destroy();
    this.context = new ContextSnapshot(this.userId);
    this.hasTriggered = false;

    for (const condition of this.conditions) {
      await condition.setUp?.();
    }

    await this.check();
    if (!this.hasTriggered) {
      this.timer1 = setInterval(() => void this.check(), this.interval);
    }
  }

  destroy(): void {
    if (this.timer1) {
      clearInterval(this.timer1);
      this.timer1 = undefined;
    }

    if (this.timer2) {
      clearTimeout(this.timer2);
      this.timer2 = undefined;
    }

    for (const condition of this.conditions) {
      void condition.destroy?.();
    }
  }

  private async check(): Promise<void> {
    if (!this.context || this.isChecking || this.hasTriggered) {
      return;
    }

    this.isChecking = true;

    try {
      const ctx = await this.context.build();
      for (const condition of this.conditions) {
        if (!(await condition.evaluate(ctx))) {
          return;
        }
      }

      this.hasTriggered = true;
      this.destroy();

      if (this.delay && this.delay > 0) {
        this.timer2 = setTimeout(() => {
          this.timer2 = undefined;
          void this.callback(ctx);
        }, this.delay);
        return;
      }

      await this.callback(ctx);
    } finally {
      this.isChecking = false;
    }
  }
}
