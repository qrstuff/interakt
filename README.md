# Interakt

Reusable browser-side condition matcher for pricing, signup, and checkout recovery flows.

The library only evaluates configured conditions. When every condition is met, it calls the host-provided callback with page context. The host application owns the effect: showing a modal, playing audio, posting to an API, syncing CRM data, or doing nothing visible.

## Install

```bash
npm install interakt
```

```ts
import Interakt, { ScrollPosition, TimeOnPage } from 'interakt';

const hatch = new Interakt({
  userId: window.currentUser?.id,
  interval: 250,
  conditions: [new TimeOnPage(30_000), new ScrollPosition(70)],
  callback: async (context) => {
    await fetch('/api/interakt/matched', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    });

    window.dispatchEvent(new CustomEvent('show-enterprise-offer', { detail: context }));
  }
});

await hatch.setUp();
```

## CDN Usage

Build output includes a standalone UMD bundle with a stable browser global:

```html
<script src="https://cdn.example.com/interakt/0.1.0/interakt.umd.cjs"></script>
<script>
  var hatch = new window.Interakt.Interakt({
    userId: 'known-user',
    conditions: [new window.Interakt.TimeOnPage(30000)],
    callback: function (context) {
      console.log('Interakt matched', context);
    }
  });

  hatch.setUp();
</script>
```

## Public API

`new Interakt(options)` creates an instance with a list of conditions and a callback.

`instance.setUp()` initializes context capture, runs condition setup hooks, waits for the optional delay, and starts polling conditions.

`instance.destroy()` stops polling and asks conditions to remove their listeners or observers.

The callback fires once per setup cycle after every condition evaluates to `true`.

## Options

```ts
type Options = {
  conditions: Condition[];
  callback: (context: Context) => void | Promise<void>;
  userId?: string;
  interval?: number;
  delay?: number;
};
```

`userId` is optional. If omitted, the context snapshot resolves and stores a FingerprintJS visitor ID.

`interval` defaults to `250` milliseconds.

`delay` defers the first condition check.

## Conditions

Built-in conditions include:

- `TimeOnPage(ms)`
- `TimeOnSite(ms)`
- `ScrollPosition(min?, max?, unit?)`
- `ElementIsVisible(selector, threshold?)`
- `ElementIsHovered(selector)`
- `ElementWasClicked(selector)`
- `ElementWasHovered(selector)`
- `ElementWasVisible(selector, threshold?)`
- `PageExited()`
- `PreviousPage(...paths)`

You can provide custom conditions:

```ts
class CheckoutFailed {
  private failed = false;

  setUp() {
    window.addEventListener('checkout_failed', () => {
      this.failed = true;
    });
  }

  evaluate() {
    return this.failed;
  }
}
```

Conditions can be synchronous or async. If a condition attaches listeners or observers, implement `destroy()` so `Interakt.destroy()` can clean it up.

## Context

The callback receives:

```ts
type Context = {
  userId: string;
  duration: {
    site: number;
    page: number;
  };
  ts: {
    site: Date;
    page: Date;
  };
  history: string[];
  scroll: {
    px: number;
    percent: number;
  };
  referrer: string | null;
};
```

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

The demo page is available through Vite at `/demo/`.
