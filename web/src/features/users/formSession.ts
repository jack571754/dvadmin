import { ref } from 'vue';

export function fieldErrorsFrom(error: unknown): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const source = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const fields = source.data && typeof source.data === 'object' ? source.data as Record<string, unknown> : source;
  for (const [key, value] of Object.entries(fields)) {
    if (!Array.isArray(value)) continue;
    const messages = value.map(item => typeof item === 'string' ? item : item && typeof item === 'object'
      && typeof (item as Record<string, unknown>).message === 'string' ? String((item as Record<string, unknown>).message) : '').filter(Boolean);
    if (messages.length) Object.defineProperty(result, key, { enumerable: true, configurable: true, writable: true, value: messages });
  }
  const message = typeof source.msg === 'string' ? source.msg : typeof source.message === 'string' ? source.message : '';
  const match = /^([a-zA-Z_][\w]*)\s*:\s*(.+)$/.exec(message);
  if (match && !Object.hasOwn(result, match[1])) Object.defineProperty(result, match[1], {
    enumerable: true, configurable: true, writable: true, value: [match[2]],
  });
  return result;
}

export function createUserFormSession(fallbackMessage: () => string) {
  const busy = ref(false);
  const message = ref('');
  const fields = ref<Record<string, string[]>>({});
  function clear() { message.value = ''; fields.value = {}; }
  return {
    busy, message, fields, clear,
    async run(submit: () => Promise<unknown>, focus: (field?: string) => void) {
      if (busy.value) return;
      busy.value = true;
      clear();
      try { await submit(); }
      catch (error) {
        if (error && typeof error === 'object' && (error as { kind?: string }).kind === 'cancelled') return;
        fields.value = fieldErrorsFrom(error);
        message.value = error instanceof Error ? error.message : fallbackMessage();
        focus(Object.keys(fields.value)[0]);
      } finally { busy.value = false; }
    },
  };
}
