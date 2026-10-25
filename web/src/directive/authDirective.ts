import { watchEffect, type App, type ObjectDirective, type WatchStopHandle } from 'vue';
import { auth, authAll, auths } from '/@/utils/authFunction';

export function permissionDirective<T>(check: (value: T) => boolean): ObjectDirective<HTMLElement, T> {
  const effects = new WeakMap<HTMLElement, WatchStopHandle>();
  const originalDisplay = new WeakMap<HTMLElement, string>();
  const bind = (el: HTMLElement, value: T) => {
    effects.get(el)?.();
    // Preserve the node and its handlers so later grants can restore it.
    effects.set(el, watchEffect(() => {
      el.style.display = check(value) ? (originalDisplay.get(el) ?? '') : 'none';
    }, { flush: 'sync' }));
  };
  return {
    beforeMount(el, binding) {
      originalDisplay.set(el, el.style.display);
      bind(el, binding.value);
    },
    updated(el, binding) { bind(el, binding.value); },
    unmounted(el) {
      effects.get(el)?.();
      effects.delete(el);
      originalDisplay.delete(el);
    },
  };
}

export function authDirective(app: App) {
  app.directive('auth', permissionDirective(auth));
  app.directive('auths', permissionDirective(auths));
  app.directive('auth-all', permissionDirective(authAll));
}
