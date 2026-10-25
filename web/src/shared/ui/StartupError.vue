<template>
  <main class="startup-failure" role="alert" aria-live="assertive">
    <section class="startup-failure__panel">
      <h1>{{ t('message.design.startupFailed') }}</h1>
      <p>{{ t('message.design.startupHint') }}</p>
      <p v-if="props.message" class="startup-failure__detail">{{ props.message }}</p>
      <el-button type="primary" :loading="status === 'initializing'" @click="emit('retry')">
        {{ status === 'initializing' ? t('message.design.startupRetrying') : t('message.design.startupRetry') }}
      </el-button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { startupState } from '/@/shared/access/startup';

const props = defineProps<{ message: string }>();
const emit = defineEmits<{ retry: [] }>();
const { t } = useI18n();
const { status } = startupState;
</script>

<style scoped>
.startup-failure{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;background:var(--admin-page-background, var(--el-bg-color-page))}
.startup-failure__panel{width:min(520px,100%);padding:32px;border:1px solid var(--el-border-color-light);border-radius:12px;background:var(--el-bg-color);box-shadow:var(--el-box-shadow-light)}
.startup-failure__panel h1{margin:0 0 12px;font-size:20px;color:var(--el-text-color-primary)}
.startup-failure__panel p{margin:0 0 12px;line-height:1.6;color:var(--el-text-color-regular)}
.startup-failure__detail{padding:10px 12px;border-radius:6px;background:var(--el-fill-color-light);color:var(--el-text-color-secondary);word-break:break-word;font-size:13px}
</style>
