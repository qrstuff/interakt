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
<script src="https://unpkg.com/interakt@0.1.1/dist/interakt.umd.cjs"></script>
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

`instance.setUp()` initializes context capture, runs condition setup hooks, and starts polling conditions.

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

`conditions`

- Type: `Condition[]`
- Required: yes
- Meaning: every condition in the array must evaluate to `true` before the callback is scheduled or executed.

`callback`

- Type: `(context: Context) => void | Promise<void>`
- Required: yes
- Meaning: host-owned side effect that runs after all conditions match.

`userId`

- Type: `string`
- Required: no
- Meaning: explicit user identifier to include in the context.
- Default behavior: if omitted, the context snapshot resolves and stores a FingerprintJS visitor ID.

`interval`

- Type: `number`
- Required: no
- Units: milliseconds
- Default: `250`
- Meaning: polling interval for condition evaluation.

`delay`

- Type: `number`
- Required: no
- Units: milliseconds
- Default: none
- Meaning: waits after all conditions match and before the callback runs.

## Conditions

Built-in conditions include:

`TimeOnPage(nbf)`

- Arguments:
- `nbf: number`
- Units: milliseconds
- Meaning: passes when `context.duration.page >= nbf`.

`TimeOnSite(nbf)`

- Arguments:
- `nbf: number`
- Units: milliseconds
- Meaning: passes when `context.duration.site >= nbf`.

`ScrollPosition(min?, max?, unit?)`

- Arguments:
- `min?: number`
- `max?: number`
- `unit?: '%' | 'px'`
- Default `unit`: `'%'`
- Meaning: passes when the current scroll position is within the provided range.
- Notes:
- If `unit` is `'%'`, the condition uses `context.scroll.percent`.
- If `unit` is `'px'`, the condition uses `context.scroll.px`.
- `min` and `max` are both optional, but at least one should be supplied for useful behavior.

`ElementIsVisible(selector, threshold?)`

- Arguments:
- `selector: string`
- `threshold?: number`
- Default `threshold`: `0.1`
- Meaning: passes while the matched element is currently intersecting the viewport at the configured threshold.

`ElementWasVisible(selector, threshold?)`

- Arguments:
- `selector: string`
- `threshold?: number`
- Default `threshold`: `0.1`
- Meaning: passes after the matched element was visible and then became non-visible again.

`ElementIsHovered(selector)`

- Arguments:
- `selector: string`
- Meaning: passes while the matched element is currently hovered.

`ElementWasHovered(selector)`

- Arguments:
- `selector: string`
- Meaning: passes after the matched element has been hovered at least once.

`ElementWasClicked(selector)`

- Arguments:
- `selector: string`
- Meaning: passes after the matched element has been clicked at least once.

`PageExited()`

- Arguments:
- none
- Meaning: passes when exit intent is detected by a mouse leave event near the top edge of the page.

`PreviousPage(...paths)`

- Arguments:
- `...paths: string[]`
- Meaning: passes when the previous entry in the captured session history matches any supplied path.

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

Custom conditions implement:

```ts
type Condition = {
  setUp?: () => void | Promise<void>;
  evaluate: (context: Context) => boolean | Promise<boolean>;
  destroy?: () => void | Promise<void>;
};
```

## Context

The callback receives:

```ts
type Context = {
  userId: string; // Explicit userId when provided, otherwise a stored FingerprintJS visitor id
  duration: {
    site: number; // Milliseconds since the site session started in this browser tab/session
    page: number; // Milliseconds since the current page instance was initialized
  };
  ts: {
    site: Date; // Session start timestamp used to derive duration.site
    page: Date; // Page start timestamp used to derive duration.page
  };
  history: string[]; // Session path history captured in sessionStorage
  scroll: {
    px: number; // Current vertical scroll offset in pixels
    percent: number; // Current vertical scroll progress as a percentage of scrollable height
  };
  referrer: string | null; // document.referrer for the current page load, or null when absent
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

The docs demo page is available through Vite at `/docs/`.
