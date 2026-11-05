import { ContextSnapshot } from '../../src';

const mockGet = jest.fn().mockResolvedValue({ visitorId: 'fp_visitor' });
const mockLoad = jest.fn().mockResolvedValue({ get: mockGet });

jest.mock('@fingerprintjs/fingerprintjs', () => ({
  __esModule: true,
  default: { load: (options?: unknown) => mockLoad(options) }
}));

describe('ContextSnapshot fingerprinting', () => {
  beforeEach(() => {
    mockLoad.mockClear();
    mockGet.mockClear();
  });

  it('does not fingerprint or store an id when no consent callback is given', async () => {
    const context = await new ContextSnapshot().build();

    expect(context.userId).toBeNull();
    expect(context.userIdSource).toBe('none');
    expect(mockLoad).not.toHaveBeenCalled();
    expect(localStorage.getItem('userId')).toBeNull();
  });

  it('does not fingerprint while consent is refused', async () => {
    const context = await new ContextSnapshot(undefined, () => false).build();

    expect(context.userId).toBeNull();
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it('treats a throwing consent callback as refused', async () => {
    const context = await new ContextSnapshot(undefined, () => {
      throw new Error('consent store unavailable');
    }).build();

    expect(context.userId).toBeNull();
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it('fingerprints and stores the visitor id once consent is granted', async () => {
    const context = await new ContextSnapshot(undefined, async () => true).build();

    expect(context.userId).toBe('fp_visitor');
    expect(context.userIdSource).toBe('fingerprint');
    expect(localStorage.getItem('userId')).toBe('fp_visitor');
    expect(mockLoad).toHaveBeenCalledWith({ monitoring: false });
  });

  it('drops the stored visitor id when consent is withdrawn', async () => {
    let consent = true;
    const snapshot = new ContextSnapshot(undefined, () => consent);
    expect((await snapshot.build()).userId).toBe('fp_visitor');

    consent = false;
    const context = await snapshot.build();

    expect(context.userId).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
  });

  it('does not store a visitor id when consent is withdrawn while fingerprinting', async () => {
    localStorage.clear();
    let consent = true;
    mockGet.mockImplementationOnce(async () => {
      consent = false;
      return { visitorId: 'fp_visitor' };
    });

    const context = await new ContextSnapshot(undefined, () => consent).build();

    expect(context.userId).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
  });

  it('prefers the explicit user id and never fingerprints when one is given', async () => {
    const context = await new ContextSnapshot('known_user', () => true).build();

    expect(context.userId).toBe('known_user');
    expect(context.userIdSource).toBe('explicit');
    expect(mockLoad).not.toHaveBeenCalled();
  });
});

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

describe('ContextSnapshot storage consent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('keeps using sessionStorage when no storageConsent option is given', async () => {
    window.history.pushState({}, '', '/pricing');

    await new ContextSnapshot('known_user').build();

    expect(sessionStorage.getItem('history')).toBe(JSON.stringify(['/pricing']));
    expect(sessionStorage.getItem('siteStartTime')).not.toBeNull();
  });

  it('writes nothing to sessionStorage without storage consent', async () => {
    sessionStorage.setItem('history', JSON.stringify(['/old']));
    sessionStorage.setItem('siteStartTime', new Date(0).toISOString());
    window.history.pushState({}, '', '/pricing');

    const context = await new ContextSnapshot(undefined, undefined, () => false).build();

    expect(context.history).toEqual(['/pricing']);
    expect(context.ts.site).toEqual(context.ts.page);
    expect(sessionStorage.getItem('history')).toBeNull();
    expect(sessionStorage.getItem('siteStartTime')).toBeNull();
  });

  it('treats a throwing storage consent check as refusal', async () => {
    window.history.pushState({}, '', '/pricing');

    await new ContextSnapshot(undefined, undefined, () => {
      throw new Error('banner not ready');
    }).build();

    expect(sessionStorage.getItem('history')).toBeNull();
  });

  it('persists history once storage consent is granted', async () => {
    window.history.pushState({}, '', '/a');
    await new ContextSnapshot(undefined, undefined, () => true).build();
    window.history.pushState({}, '', '/pricing');

    const context = await new ContextSnapshot(undefined, undefined, async () => true).build();

    expect(context.history).toEqual(['/a', '/pricing']);
  });
});
