<template>
  <div v-if="message" class="user-form-error" role="alert" tabindex="-1">
    <p>{{ message }}</p>
    <ul v-if="Object.keys(fields).length">
      <li v-for="(errors, field) in fields" :key="field">{{ titles[field] || fallbackTitle }}：{{ errors.join(' ') }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string; fields: Record<string, string[]>; titles: Record<string, string>; fallbackTitle: string }>();
</script>

<style scoped>
.user-form-error{padding:12px 16px;margin-bottom:16px;border:1px solid var(--el-color-danger-light-5);border-radius:6px;background:var(--el-color-danger-light-9);color:var(--el-color-danger);font-size:13px}
.user-form-error p{margin:0}.user-form-error ul{margin:6px 0 0;padding-left:18px}
</style>
