interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
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
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: Math.random().toString(36).substr(2, 9),
        fn,
        resolve,
        reject,
        retries,
        lastAttempt: 0
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxConcurrent);
      
      await Promise.allSettled(
        batch.map(request => this.processRequest(request))
      );

      // تاخیر بین batch ها
      if (this.queue.length > 0) {
        await this.delay(this.minDelay);
      }
    }

    this.isProcessing = false;
  }

  private async processRequest(request: QueuedRequest) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelay) {
      await this.delay(this.minDelay - timeSinceLastRequest);
    }

    try {
      const result = await request.fn();
      request.resolve(result);
      this.lastRequestTime = Date.now();
    } catch (error) {
      if (request.retries > 0 && this.isRetryableError(error)) {
        request.retries--;
        request.lastAttempt = Date.now();
        
        // Exponential backoff
        const delay = Math.pow(2, 3 - request.retries) * 1000;
        await this.delay(delay);
        
        // اضافه کردن به انتهای صف برای retry
        this.queue.push(request);
      } else {
        request.reject(error);
      }
    }
  }

  private isRetryableError(error: any): boolean {
    if (error?.message?.includes('Rate limited')) return true;
    if (error?.message?.includes('429')) return true;
    if (error?.message?.includes('Too Many Requests')) return true;
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
