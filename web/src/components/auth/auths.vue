<template>
  <slot v-if="allowed" />
</template>

<script setup lang="ts" name="auths">
import { computed } from 'vue';
import { auths } from '/@/utils/authFunction';

const props = withDefaults(defineProps<{ value?: string[] }>(), { value: () => [] });
const allowed = computed(() => auths(props.value));
</script>
