<template>
  <slot v-if="allowed" />
</template>

<script setup lang="ts" name="auth">
import { computed } from 'vue';
import { auth } from '/@/utils/authFunction';

const props = withDefaults(defineProps<{ value?: string }>(), { value: '' });
const allowed = computed(() => auth(props.value));
</script>
