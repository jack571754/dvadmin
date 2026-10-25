<template>
  <div v-loading="loading">
    <el-alert v-if="loadError || state.error.value" :title="loadError || state.error.value" type="error" :closable="false">
      <el-button v-if="loadError" @click="load">{{ $t('message.design.retry') }}</el-button>
    </el-alert>
    <p>{{ $t('message.design.roleUserImmediate') }}</p>
    <el-transfer v-model="selected" filterable :data="options" :props="{ key: 'id', label: 'name' }"
      :titles="[$t('message.pages.role.transfer.unassignedUsers'), $t('message.pages.role.transfer.assignedUsers')]"
      @change="change" />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { roleAuthorizationKey } from '/@/features/roles/authorization';
import { getAllUsers } from './api';
import { auth } from '/@/utils/authFunction';
import { useI18n } from 'vue-i18n';
const state = inject(roleAuthorizationKey)!;
const { t } = useI18n();
const candidates = ref<Array<{ id: string | number; name: string }>>([]);
const selected = ref<Array<string | number>>([]);
const loading = ref(false), loadError = ref('');
let alive = true, request = 0;
const options = computed(() => Array.from(new Map([...candidates.value, ...state.users.value].map(row => [row.id, row])).values())
  .map(row => ({ ...row, disabled: state.writing.value || loading.value || !auth('role:SetUserRole') })));
const restore = () => { selected.value = state.users.value.map(row => row.id); };
watch(() => state.users.value, restore, { immediate: true });
onBeforeUnmount(() => { alive = false; request++; });
onMounted(load);
async function load() {
  const current = ++request, role = state.role.value;
  loading.value = true; loadError.value = '';
  try { const rows = await getAllUsers(); if (alive && current === request && role === state.role.value) candidates.value = rows; }
  catch (failure) { if (alive && current === request) loadError.value = failure instanceof Error ? failure.message : t('message.design.roleFailed'); }
  finally { if (alive && current === request) loading.value = false; }
}
async function change(_value: Array<string | number>, direction: 'left' | 'right', movedKeys: Array<string | number>) {
  if (loading.value) { restore(); return; }
  await state.assignUsers(direction, movedKeys);
  if (alive) restore();
}
</script>
