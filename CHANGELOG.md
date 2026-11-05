# Changelog

## 0.3.0

### Breaking

- Fingerprinting is off by default. Without an explicit `userId`, `context.userId` is `null` unless the new `fingerprintConsent()` option returns `true`.
- `Context.userId` is now `string | null`, and `Context.userIdSource` (`'explicit' | 'fingerprint' | 'none'`) is new.

### Added

- `fingerprintConsent?: () => boolean | Promise<boolean>`. A host-owned consent check runs on every context build. FingerprintJS is lazily loaded (a separate chunk in the ES build) only after consent.
- `storageConsent?: () => boolean | Promise<boolean>`. When provided, session history and site start time stay in memory until it returns `true`. Omit it to keep the previous `sessionStorage` behaviour.

### Changed

- If consent is refused, withdrawn or throws, the stored visitor ID is removed from `localStorage`.

## 0.2.0

- `IsMobileDevice()` and `Not(...)` conditions.
