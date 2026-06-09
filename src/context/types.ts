export type Context = {
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
