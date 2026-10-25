import { ref } from 'vue';

const listeners = new Set<() => void>();
export const sessionRevision = ref(0);
export const sessionViewReady = ref(false);

export function notifySessionChanged() {
  sessionRevision.value++;
  sessionViewReady.value = false;
  listeners.forEach(reset => reset());
}

export function captureSession() {
  const revision = sessionRevision.value;
  const token = window.localStorage.getItem('token');
  return () => {
    if (revision !== sessionRevision.value || token !== window.localStorage.getItem('token')) {
      throw new DOMException('Session changed', 'AbortError');
    }
  };
}

export function onSessionChanged(reset: () => void) {
  listeners.add(reset);
  return () => { listeners.delete(reset); };
}

// Other tabs can sign out or replace the shared token too.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.storageArea === window.localStorage && (event.key === 'token' || event.key === null)) {
      notifySessionChanged();
    }
  });
}
