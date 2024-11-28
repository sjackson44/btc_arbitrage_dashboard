export class RateLimiter {
  private lastRequest: number = 0;
  private requestQueue: (() => void)[] = [];
  private processing: boolean = false;

  constructor(
    private rateLimit: number,  // requests per second
    private burstLimit?: number // max burst requests
  ) {}

  async execute(fn: () => void) {
    return new Promise<void>((resolve) => {
      this.requestQueue.push(() => {
        fn();
        resolve();
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    this.processing = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;
      const minDelay = 1000 / this.rateLimit;

      if (timeSinceLastRequest < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
      }

      const request = this.requestQueue.shift();
      if (request) {
        request();
        this.lastRequest = Date.now();
      }
    }

    this.processing = false;
  }
} 