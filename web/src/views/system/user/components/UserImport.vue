<template>
  <el-button v-if="auth('user:Import')" type="success" @click="open">{{ $t('message.pages.user.buttons.import') }}</el-button>
  <el-dialog v-model="visible" :title="$t('message.pages.user.buttons.import')" width="min(480px, 95vw)" append-to-body :close-on-click-modal="false" :before-close="beforeClose">
    <el-alert v-if="error" :title="error" type="error" :closable="false" />
    <label for="user-import-file">{{ $t('message.design.userImportFile') }}</label>
    <input id="user-import-file" ref="input" type="file" accept=".xlsx,.xls" :disabled="busy" @change="selectFile" />
    <p>{{ $t('message.design.userImportHint') }}</p>
    <el-button :disabled="busy" @click="template('import_data')">{{ $t('message.components.importExcel.downloadTemplate') }}</el-button>
    <el-button :disabled="busy" @click="template('update_template')">{{ $t('message.components.importExcel.batchUpdateTemplate') }}</el-button>
    <template #footer>
      <el-button type="primary" :loading="busy" :disabled="!file || !auth('user:Import')" @click="submit">{{ $t('message.pages.user.buttons.confirm') }}</el-button>
      <el-button :disabled="busy" @click="close">{{ $t('message.pages.user.buttons.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, onDeactivated, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { auth } from '/@/utils/authFunction';
import { request, downloadFile } from '/@/utils/service';
import { captureSession } from '/@/shared/access/sessionEvents';
import { successMessage } from '/@/utils/message';
const { t } = useI18n();
const emit = defineEmits<{ completed: [] }>();
const visible = ref(false), busy = ref(false), error = ref('');
const file = ref<File>(), uploaded = ref('');
const input = ref<HTMLInputElement>();
let generation = 0;
function dispose() { generation++; visible.value = false; file.value = undefined; uploaded.value = ''; error.value = ''; }
onDeactivated(dispose);
onBeforeUnmount(dispose);
function open() { if (auth('user:Import')) { error.value = ''; visible.value = true; } }
function close() {
  if (busy.value) return;
  visible.value = false; file.value = undefined; uploaded.value = ''; error.value = '';
  if (input.value) input.value.value = '';
}
function beforeClose(done: () => void) { if (!busy.value) { close(); done(); } }
function selectFile(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0]; uploaded.value = ''; error.value = '';
}
function assertAccess(assertCurrent: () => void) {
  assertCurrent();
  if (!auth('user:Import')) throw new Error(t('message.design.formAccessChanged'));
}
function report(failure: unknown) {
  if (failure && typeof failure === 'object' && ((failure as { kind?: string }).kind === 'cancelled' || (failure as Error).name === 'AbortError')) return;
  error.value = failure instanceof Error ? failure.message : t('message.design.userImportFailed');
}
async function template(action: string) {
  if (busy.value || !auth('user:Import')) return;
  busy.value = true;
  try { await downloadFile({ url: `/api/system/user/${action}/`, method: 'get' }); }
  catch (failure) { report(failure); }
  finally { busy.value = false; }
}
async function submit() {
  if (busy.value || !file.value || !auth('user:Import')) return;
  if (!/\.(xlsx|xls)$/i.test(file.value.name)) { error.value = t('message.design.userImportFile'); return; }
  const assertSession = captureSession(), current = generation;
  const assertCurrent = () => {
    assertSession();
    if (current !== generation) throw new DOMException('Import view changed', 'AbortError');
  };
  busy.value = true; error.value = '';
  try {
    assertAccess(assertCurrent);
    if (!uploaded.value) {
      const form = new FormData(); form.append('file', file.value);
      const response = await request({ url: '/api/system/file/', method: 'post', data: form, timeout: 60000, headers: { 'Content-Type': undefined } });
      assertAccess(assertCurrent);
      if (typeof response.data?.url !== 'string' || !response.data.url) throw new Error(t('message.design.userImportFailed'));
      uploaded.value = response.data.url;
    }
    assertAccess(assertCurrent);
    await request({ url: '/api/system/user/import_data/', method: 'post', timeout: 60000, data: { url: uploaded.value } });
    assertAccess(assertCurrent);
    successMessage('message.components.importExcel.importSuccess');
    busy.value = false; close(); emit('completed');
  } catch (failure) { report(failure); }
  finally { busy.value = false; }
}
</script>
<style scoped>
label{display:block;margin:16px 0 8px}p{margin:12px 0;color:var(--el-text-color-secondary)}input{max-width:100%}
</style>
