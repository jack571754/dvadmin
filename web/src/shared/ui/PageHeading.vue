<template>
  <div class="admin-page-heading">
    <div class="admin-page-heading__copy">
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="admin-page-heading__actions"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<style scoped>
.admin-page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:26px}
.admin-page-heading__copy{min-width:0}
h1{font-size:25px;line-height:1.4;font-weight:650;letter-spacing:-.6px;color:var(--admin-text);margin:0}
p{font-size:13px;color:var(--admin-muted);margin:7px 0 0;line-height:1.7}
.admin-page-heading__actions{display:flex;align-items:center;gap:10px;flex-shrink:0}
@media(max-width:767px){.admin-page-heading{align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:20px}h1{font-size:22px}}
</style>
