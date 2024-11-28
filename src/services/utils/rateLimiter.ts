export class RateLimiter {
  private requestCount: number = 0;
  private lastReset: number = Date.now();

  constructor(
    private limit: number,
    private windowMs: number
  ) {}

  public canMakeRequest(): boolean {
    this.resetIfNeeded();
    return this.requestCount < this.limit;
  }

  public incrementRequests(): void {
    this.resetIfNeeded();
    this.requestCount++;
  }

  private resetIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastReset >= this.windowMs) {
      this.requestCount = 0;
      this.lastReset = now;
    }
  }
}