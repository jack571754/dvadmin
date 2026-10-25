import { createApp, h, nextTick, ref, withDirectives } from 'vue';
import pinia from '../../src/stores/index';
import { BtnPermissionStore } from '../../src/stores/btnPermission';
import { BtnPermissionStore as legacyStore } from '../../src/plugin/permission/store.permission';
import { authDirective } from '../../src/directive/authDirective';
import Auth from '../../src/components/auth/auth.vue';
import Auths from '../../src/components/auth/auths.vue';
import AuthAll from '../../src/components/auth/authAll.vue';
import { Session } from '../../src/utils/storage';

export async function mountPermissionHarness() {
  const store = BtnPermissionStore(pinia);
  const requested = ref('harness:edit');
  const host = document.createElement('div');
  host.id = 'permission-harness';
  document.body.append(host);
  let single, some, every;
  const app = createApp({ render() {
    return h('div', [
      withDirectives(h('button', { id: 'permission-single', style: { display: 'inline-flex' } }, 'single'), [[single, requested.value]]),
      withDirectives(h('button', { id: 'permission-some' }, 'some'), [[some, ['harness:edit', 'harness:view']]]),
      withDirectives(h('button', { id: 'permission-every' }, 'every'), [[every, ['harness:edit', 'harness:view']]]),
      h(Auth, { value: requested.value }, () => h('span', { id: 'component-single' }, 'single')),
      h(Auths, { value: ['harness:edit', 'harness:view'] }, () => h('span', { id: 'component-some' }, 'some')),
      h(AuthAll, { value: ['harness:edit', 'harness:view'] }, () => h('span', { id: 'component-every' }, 'every')),
    ]);
  } });
  app.use(pinia);
  authDirective(app);
  single = app.directive('auth');
  some = app.directive('auths');
  every = app.directive('auth-all');
  app.mount(host);
  store.resetPermissions();
  await nextTick();
  return {
    sameStore: BtnPermissionStore === legacyStore,
    async load() { await store.getBtnPermissionStore(); await nextTick(); },
    async binding(value) { requested.value = value; await nextTick(); },
    async logout() { Session.remove('token'); await nextTick(); },
    async unmount() { app.unmount(); host.remove(); await nextTick(); },
  };
}
