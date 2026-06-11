import device from 'current-device';
import {
  ElementIsHovered,
  IsMobileDevice,
  ElementWasClicked,
  ElementWasHovered,
  Not,
  PageExited,
  PreviousPage,
  ScrollPosition,
  TimeOnPage,
  TimeOnSite,
  type Context
} from '../../src';

jest.mock('current-device', () => ({
  __esModule: true,
  default: {
    mobile: jest.fn()
  }
}));

const mockedDevice = device as unknown as { mobile: jest.Mock<boolean, []> };

function createContext(overrides: Partial<Context> = {}): Context {
  return {
    userId: 'user_123',
    duration: {
      site: 1000,
      page: 500
    },
    ts: {
      site: new Date(),
      page: new Date()
    },
    history: ['/pricing'],
    scroll: {
      px: 300,
      percent: 50
    },
    referrer: null,
    ...overrides
  };
}

describe('conditions', () => {
  afterEach(() => {
    mockedDevice.mobile.mockReset();
  });

  it('evaluates page and site duration thresholds', () => {
    expect(new TimeOnPage(500).evaluate(createContext())).toBe(true);
    expect(new TimeOnPage(501).evaluate(createContext())).toBe(false);
    expect(new TimeOnSite(1000).evaluate(createContext())).toBe(true);
    expect(new TimeOnSite(1001).evaluate(createContext())).toBe(false);
  });

  it('evaluates scroll position ranges by percent or pixels', () => {
    expect(new ScrollPosition(40, 60).evaluate(createContext())).toBe(true);
    expect(new ScrollPosition(60, undefined).evaluate(createContext())).toBe(false);
    expect(new ScrollPosition(250, 350, 'px').evaluate(createContext())).toBe(true);
    expect(new ScrollPosition(0, 49).evaluate(createContext())).toBe(false);
  });

  it('evaluates the previous page in session history', () => {
    expect(
      new PreviousPage('/signup').evaluate(createContext({ history: ['/signup', '/pricing'] }))
    ).toBe(true);
    expect(new PreviousPage('/billing').evaluate(createContext({ history: ['/signup'] }))).toBe(
      false
    );
  });

  it('detects whether the current device is mobile', () => {
    mockedDevice.mobile.mockReturnValueOnce(true);
    expect(new IsMobileDevice().evaluate()).toBe(true);

    mockedDevice.mobile.mockReturnValueOnce(false);
    expect(new IsMobileDevice().evaluate()).toBe(false);
  });

  it('negates another condition result and forwards lifecycle hooks', async () => {
    const condition = {
      setUp: jest.fn(),
      evaluate: jest.fn().mockReturnValue(true),
      destroy: jest.fn()
    };
    const wrapped = new Not(condition);

    await wrapped.setUp?.();
    expect(condition.setUp).toHaveBeenCalledTimes(1);

    await expect(wrapped.evaluate(createContext())).resolves.toBe(false);
    expect(condition.evaluate).toHaveBeenCalledWith(createContext());

    await wrapped.destroy?.();
    expect(condition.destroy).toHaveBeenCalledTimes(1);
  });

  it('detects page exit intent and removes its listener on destroy', () => {
    const condition = new PageExited();
    condition.setUp();

    document.dispatchEvent(
      new MouseEvent('mouseleave', {
        clientY: 4
      })
    );

    expect(condition.evaluate()).toBe(true);
    condition.destroy();
  });

  it('detects when an element was clicked and removes its listener on destroy', () => {
    document.body.innerHTML = '<button id="target">Click me</button>';
    const condition = new ElementWasClicked('#target');
    condition.setUp();

    expect(condition.evaluate()).toBe(false);
    document.querySelector<HTMLButtonElement>('#target')?.click();

    expect(condition.evaluate()).toBe(true);
    condition.destroy();
  });

  it('detects when an element is currently hovered and resets after mouseleave', () => {
    document.body.innerHTML = '<button id="target">Hover me</button>';
    const condition = new ElementIsHovered('#target');
    const target = document.querySelector<HTMLElement>('#target');
    condition.setUp();

    expect(condition.evaluate()).toBe(false);

    target?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(condition.evaluate()).toBe(true);

    target?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(condition.evaluate()).toBe(false);

    condition.destroy();
  });

  it('detects when an element was hovered and keeps that state after mouseleave', () => {
    document.body.innerHTML = '<button id="target">Hover me</button>';
    const condition = new ElementWasHovered('#target');
    const target = document.querySelector<HTMLElement>('#target');
    condition.setUp();

    expect(condition.evaluate()).toBe(false);

    target?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    target?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    expect(condition.evaluate()).toBe(true);
    condition.destroy();
  });
});
