export class BaseApiService {
  protected static async fetchWithRetry(
    url: string,
    options: any = {},
    retries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;
    const retryDelay = 5000; // 5 seconds

    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Retry ${i + 1}/${retries} failed:`, lastError.message);
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError || new Error('All retries failed');
  }
} 