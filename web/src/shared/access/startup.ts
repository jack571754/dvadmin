import { ref } from 'vue';
import { isCancellation } from '../api/errors.ts';

export type StartupStatus = 'idle' | 'initializing' | 'ready' | 'failed';

function messageOf(error: unknown, fallback: () => string): string {
  return error instanceof Error && error.message ? error.message : fallback();
}

/**
 * One visible startup attempt at a time. A retry replaces the failed attempt instead of
 * stacking navigation, and a superseded attempt can neither publish success nor failure.
 */
export function createStartupState(fallbackMessage: () => string = () => '') {
  const status = ref<StartupStatus>('idle');
  const message = ref('');
  let attempt = 0;
  let retryAction: (() => void) | undefined;

  function begin(): number {
    attempt++;
    status.value = 'initializing';
    message.value = '';
    retryAction = undefined;
    return attempt;
  }

  function ready(current: number) {
    if (current !== attempt || status.value !== 'initializing') return;
    status.value = 'ready';
    message.value = '';
    retryAction = undefined;
  }

  function fail(current: number, error: unknown, retry: () => void): boolean {
    if (current !== attempt || status.value !== 'initializing' || isCancellation(error)) return false;
    status.value = 'failed';
    message.value = messageOf(error, fallbackMessage);
    retryAction = retry;
    return true;
  }

  function retry(): boolean {
    if (status.value !== 'failed' || !retryAction) return false;
    const action = retryAction;
    begin();
    action();
    return true;
  }

  function reset() {
    attempt++;
    status.value = 'idle';
    message.value = '';
    retryAction = undefined;
  }

  return { status, message, begin, ready, fail, retry, reset };
}

export type StartupState = ReturnType<typeof createStartupState>;
export const startupState = createStartupState();
