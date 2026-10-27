<template>
  <el-dialog v-model="visible" :title="`${targetName} - 平台权限`" width="620px" destroy-on-close>
    <p v-if="error" role="alert">{{ error }}</p>
    <el-table v-loading="loading" :data="rows" border>
      <el-table-column label="授权" width="80">
        <template #default="{ row }"><el-checkbox v-model="row.enabled" :disabled="!canSave || saving" /></template>
      </el-table-column>
      <el-table-column prop="label" label="平台" />
      <el-table-column label="数据范围" min-width="230">
        <template #default="{ row }">
          <el-select v-model="row.scope" :disabled="!row.enabled || !canSave || saving">
            <el-option label="仅本人创建的工单" value="self" />
            <el-option label="平台全部已提交工单" value="platform_all" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button :disabled="saving" @click="visible = false">取消</el-button>
      <el-button v-if="canSave" type="primary" :loading="saving" :disabled="loading || !!error" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { successMessage } from '/@/utils/message';
import { GetPlatformPermissions, UpdatePlatformPermissions } from '../api';
import { auth } from '/@/utils/authFunction';
import { captureSession, onSessionChanged } from '/@/shared/access/sessionEvents';
interface PermissionRow { platform: string; label: string; enabled: boolean; scope: 'self' | 'platform_all' }
const visible = ref(false), loading = ref(false), saving = ref(false), error = ref('');
const targetName = ref(''), targetId = ref<number>(), rows = ref<PermissionRow[]>([]);
const canSave = computed(() => auth('user:PlatformPermissionUpdate'));
let generation = 0;
const stop = onSessionChanged(() => { generation++; visible.value = false; rows.value = []; });
onBeforeUnmount(() => { generation++; stop(); });
async function open(row: { id: number; name?: string; username?: string }) {
  if (!auth('user:PlatformPermission')) return;
  const current = ++generation, assertCurrent = captureSession();
  visible.value = true; loading.value = true; error.value = ''; rows.value = [];
  targetId.value = row.id; targetName.value = row.name || row.username || '';
  try {
    const response = await GetPlatformPermissions(row.id);
    assertCurrent(); if (current !== generation) return;
    const data = response.data;
    const permissions = new Map<string, PermissionRow['scope']>((data.permissions || []).map((item: PermissionRow) => [item.platform, item.scope]));
    rows.value = (data.platforms || []).map((item: { value: string; label: string }) => ({
      platform: item.value, label: item.label, enabled: permissions.has(item.value), scope: permissions.get(item.value) || 'self',
    }));
  } catch (failure) { if (current === generation) error.value = failure instanceof Error ? failure.message : '平台权限加载失败'; }
  finally { if (current === generation) loading.value = false; }
}
async function save() {
  if (!targetId.value || !canSave.value || saving.value || loading.value) return;
  const assertCurrent = captureSession(), current = generation;
  saving.value = true;
  try {
    await UpdatePlatformPermissions(targetId.value, rows.value.filter(row => row.enabled).map(({ platform, scope }) => ({ platform, scope })));
    assertCurrent(); if (current !== generation) return;
    visible.value = false; successMessage('平台权限保存成功');
  } catch (failure) { if (current === generation) error.value = failure instanceof Error ? failure.message : '平台权限保存失败'; }
  finally { saving.value = false; }
}
defineExpose({ open });
</script>
