<template>
  <div v-loading="state.treeLoading.value">
    <el-alert v-if="state.treeError.value" :title="state.treeError.value" type="error" :closable="false">
      <el-button @click="state.loadTree()">{{ $t('message.design.retry') }}</el-button>
    </el-alert>
    <p>{{ $t('message.design.roleImmediate') }}</p>
    <el-tree ref="treeRef" :data="state.tree.value" :props="treeProps" node-key="id"
      :default-checked-keys="checkedKeys" check-strictly highlight-current show-checkbox default-expand-all
      :check-on-click-leaf="false" @check="toggle" @node-click="select" />
  </div>
</template>
<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue';
import { roleAuthorizationKey } from '/@/features/roles/authorization';
const state = inject(roleAuthorizationKey)!;
const treeRef = ref();
const treeProps = { children: 'children', label: 'name', disabled: () => state.writing.value || !state.allowed('menu') };
const checkedKeys = computed(() => {
  const ids: (string | number)[] = [];
  const visit = (rows: any[]) => rows.forEach(row => { if (row.isCheck) ids.push(row.id); if (row.children) visit(row.children); });
  visit(state.tree.value); return ids;
});
async function toggle(node: any, values: { checkedKeys: (string | number)[] }) {
  await state.toggleMenu(node, values.checkedKeys.includes(node.id));
  await nextTick(); treeRef.value?.setCheckedKeys(checkedKeys.value);
}
async function select(node: any) {
  await state.select(node);
  await nextTick(); treeRef.value?.setCurrentKey(state.selected.value?.id);
}
</script>
