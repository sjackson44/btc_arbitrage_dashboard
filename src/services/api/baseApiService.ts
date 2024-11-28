import { API_CONFIG } from '../../config/api';

export class BaseApiService {
  private static corsProxyIndex = 0;

  protected static async fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
    const proxies = [
      API_CONFIG.CORS_PROXY.PRIMARY,
      API_CONFIG.CORS_PROXY.FALLBACK,
      API_CONFIG.CORS_PROXY.BACKUP
    ];
    
    let lastError: Error | null = null;

    // Try each proxy in sequence
    for (let i = 0; i < proxies.length; i++) {
      const proxy = proxies[(BaseApiService.corsProxyIndex + i) % proxies.length];
      const proxyUrl = proxy + encodeURIComponent(url);

      try {
        console.log(`Attempting proxy ${i + 1}/${proxies.length}:`, proxy);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(proxyUrl, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Origin': window.location.origin,
            'x-requested-with': 'XMLHttpRequest'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Update the proxy index for the next successful proxy
        BaseApiService.corsProxyIndex = (BaseApiService.corsProxyIndex + i) % proxies.length;
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Proxy ${proxy} failed:`, lastError.message);
        
        // If this isn't the last proxy, continue to next one
        if (i < proxies.length - 1) {
          continue;
        }
      }
    }

    throw lastError || new Error('All proxies failed');
  }

  protected static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries: number = API_CONFIG.RETRY.COUNT
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await this.fetchWithProxy(url, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Retry ${i + 1}/${retries} failed:`, lastError.message);
        
        if (i < retries - 1) {
          const delay = API_CONFIG.RETRY.INTERVAL * Math.pow(API_CONFIG.RETRY.BACKOFF_FACTOR, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All retries failed');
  }
}