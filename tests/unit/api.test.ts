import Interakt, { type Condition, type Context } from '../../src';
import { waitForExpect } from './helpers';

function createCondition(evaluate: jest.Mock<boolean, [Context]>): Condition {
  return {
    setUp: jest.fn(),
    evaluate,
    destroy: jest.fn()
  };
}

describe('Interakt', () => {
  it('calls the callback once when every condition is met', async () => {
    const condition = createCondition(jest.fn().mockReturnValue(true));
    const callback = jest.fn();
    const hatch = new Interakt({
      userId: 'user_123',
      conditions: [condition],
      interval: 10,
      callback
    });

    await hatch.setUp();

    await waitForExpect(() => {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user_123' }));
    });

    await new Promise((resolve) => window.setTimeout(resolve, 25));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(condition.destroy).toHaveBeenCalled();
  });

  it('waits until all conditions evaluate to true', async () => {
    const first = createCondition(jest.fn().mockReturnValue(true));
    const second = createCondition(jest.fn().mockReturnValueOnce(false).mockReturnValue(true));
    const callback = jest.fn();
    const hatch = new Interakt({
      userId: 'user_123',
      conditions: [first, second],
      interval: 10,
      callback
    });

    await hatch.setUp();

    await waitForExpect(() => expect(callback).toHaveBeenCalledTimes(1));
    expect(first.evaluate).toHaveBeenCalled();
    expect(second.evaluate).toHaveBeenCalled();
  });

  it('can be destroyed before conditions are met', async () => {
    const condition = createCondition(jest.fn().mockReturnValue(false));
    const callback = jest.fn();
    const hatch = new Interakt({
      userId: 'user_123',
      conditions: [condition],
      interval: 10,
      callback
    });

    await hatch.setUp();
    hatch.destroy();

    await new Promise((resolve) => window.setTimeout(resolve, 25));
    expect(callback).not.toHaveBeenCalled();
    expect(condition.destroy).toHaveBeenCalled();
  });

  it('supports host-owned callback side effects', async () => {
    const hostEffect = jest.fn();
    const hatch = new Interakt({
      userId: 'user_123',
      conditions: [
        {
          evaluate: () => true
        }
      ],
      callback: async (ctx) => {
        hostEffect(ctx.userId, ctx.history);
      }
    });

    await hatch.setUp();

    await waitForExpect(() =>
      expect(hostEffect).toHaveBeenCalledWith('user_123', expect.arrayContaining(['/']))
    );
  });

  it('delays callback execution until after all conditions are met', async () => {
    jest.useFakeTimers();

    try {
      const callback = jest.fn();
      const hatch = new Interakt({
        userId: 'user_123',
        conditions: [createCondition(jest.fn().mockReturnValue(true))],
        delay: 100,
        callback
      });

      await hatch.setUp();

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(99);
      await Promise.resolve();
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('cancels a delayed callback when destroyed before the delay elapses', async () => {
    jest.useFakeTimers();

    try {
      const callback = jest.fn();
      const hatch = new Interakt({
        userId: 'user_123',
        conditions: [createCondition(jest.fn().mockReturnValue(true))],
        delay: 100,
        callback
      });

      await hatch.setUp();
      hatch.destroy();

      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(callback).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
