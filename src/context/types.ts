export type FingerprintConsent = () => boolean | Promise<boolean>;

export type UserIdSource = 'explicit' | 'fingerprint' | 'none';

export type Context = {
  userId: string | null;
  userIdSource: UserIdSource;
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
