interface QueuedRequest<T = unknown> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  retries: number;
  lastAttempt: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private readonly maxConcurrent = 2; // حداکثر 2 درخواست همزمان
  private readonly minDelay = 1000; // حداقل 1 ثانیه بین درخواست‌ها
  private lastRequestTime = 0;

  async add<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: Math.random().toString(36).substr(2, 9),
        fn,
        resolve,
        reject,
        retries,
        lastAttempt: 0
      };

      this.queue.push(request as unknown as QueuedRequest);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxConcurrent);
      await Promise.allSettled(batch.map(request => this.processRequest(request)));
      if (this.queue.length > 0) {
        await this.delay(this.minDelay);
      }
    }

    this.isProcessing = false;
  }

  private async processRequest<T>(request: QueuedRequest<T>) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      await this.delay(this.minDelay - timeSinceLastRequest);
    }

    try {
      const result = await request.fn();
      request.resolve(result);
      this.lastRequestTime = Date.now();
    } catch (error: unknown) {
      if (request.retries > 0 && this.isRetryableError(error)) {
        request.retries--;
        request.lastAttempt = Date.now();
        const delay = Math.pow(2, 3 - request.retries) * 1000;
        await this.delay(delay);
        this.queue.push(request as unknown as QueuedRequest);
      } else {
        request.reject(error);
      }
    }
  }

  private isRetryableError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error ?? '');
    if (msg.includes('Rate limited')) return true;
    if (msg.includes('429')) return true;
    if (msg.includes('Too Many Requests')) return true;
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clear() {
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

export const requestQueue = new RequestQueue();
