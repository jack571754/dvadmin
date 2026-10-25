import type { Emitter, EventType, Handler } from 'mitt';

/** Retain the exact handler references owned by one mounted component. */
export function createEventSubscriptions<Events extends Record<EventType, unknown>>(bus: Emitter<Events>) {
  const cleanup: Array<() => void> = [];
  return {
    on<Key extends keyof Events>(event: Key, handler: Handler<Events[Key]>) {
      bus.on(event, handler);
      cleanup.push(() => bus.off(event, handler));
    },
    clear() { cleanup.splice(0).forEach(stop => stop()); },
  };
}
