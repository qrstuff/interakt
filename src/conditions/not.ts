import type { Condition } from './types';

export class Not implements Condition {
  private readonly condition: Condition;

  constructor(condition: Condition) {
    this.condition = condition;
  }

  async setUp(): Promise<void> {
    await this.condition.setUp?.();
  }

  async evaluate(ctx: Parameters<Condition['evaluate']>[0]): Promise<boolean> {
    return !(await this.condition.evaluate(ctx));
  }

  async destroy(): Promise<void> {
    await this.condition.destroy?.();
  }
}
