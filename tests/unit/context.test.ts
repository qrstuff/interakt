import { ContextSnapshot } from '../../src';

describe('ContextSnapshot', () => {
  it('captures user, timing, history, scroll, and referrer context', async () => {
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://example.com/start'
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 500
    });
    window.history.pushState({}, '', '/pricing');

    const snapshot = new ContextSnapshot('known_user');
    const context = await snapshot.build();

    expect(context.userId).toBe('known_user');
    expect(context.history).toEqual(['/pricing']);
    expect(context.referrer).toBe('https://example.com/start');
    expect(context.scroll).toMatchObject({
      px: 500,
      percent: 50
    });
    expect(context.duration.page).toBeGreaterThanOrEqual(0);
    expect(context.duration.site).toBeGreaterThanOrEqual(-5);
  });

  it('does not duplicate the current path when the page is refreshed', async () => {
    window.history.pushState({}, '', '/pricing');

    new ContextSnapshot('known_user');
    new ContextSnapshot('known_user');

    const context = await new ContextSnapshot('known_user').build();

    expect(context.history).toEqual(['/pricing']);
  });
});
