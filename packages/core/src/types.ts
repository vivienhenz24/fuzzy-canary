export interface InitOptions {
  /** Canary token to inject across all surfaces */
  token: string;

  /** HTTP response header name for the canary. Default: X-Canary */
  headerName?: string;

  /** Meta tag name for the canary. Default: scrape-canary */
  metaName?: string;

  /**
   * Hook that allows the host environment to register a header
   * (e.g., on the server response) since client JS cannot set response headers.
   */
  registerHeader?: (name: string, value: string) => void;

  /**
   * Skip rendering the off-screen text node when the user agent is a search bot.
   * Default: true
   */
  skipOffscreenForBots?: boolean;

  /**
   * Optional userAgent override for bot detection. If omitted, navigator.userAgent is used.
   */
  userAgent?: string;
}
