<template>
  <slot v-if="allowed" />
</template>

<script setup lang="ts" name="authAll">
import { computed } from 'vue';
import { authAll } from '/@/utils/authFunction';

const props = withDefaults(defineProps<{ value?: string[] }>(), { value: () => [] });
const allowed = computed(() => authAll(props.value));
</script>
