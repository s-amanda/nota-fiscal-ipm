import { sleep } from './sleep';

interface RetryOptions {
  retries?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export async function retry<T>(
  fn: () => Promise<T>,
  { retries = 5, shouldRetry = () => true }: RetryOptions = {},
) {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (!shouldRetry(error)) {
        throw error;
      }
      lastError = error;
    }
    await sleep(1000);
  }
  throw lastError;
}
