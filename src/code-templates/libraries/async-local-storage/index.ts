import { AsyncLocalStorage } from 'async_hooks';

let currentContext: AsyncLocalStorage<unknown>;

export function context<T = any>(): AsyncLocalStorage<T> {
  if (currentContext === null) {
    currentContext = new AsyncLocalStorage<T>();
  }

  return currentContext as AsyncLocalStorage<T>;
}
