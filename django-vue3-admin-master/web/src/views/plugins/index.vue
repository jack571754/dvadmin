<template>
  <div class="plugins-container">
    <component :is="currentComponent" v-if="currentComponent" />
    <div v-else class="plugin-not-found">
      <el-result
        icon="warning"
        title="插件未找到"
        sub-title="请检查插件配置是否正确"
      >
        <template #extra>
          <el-button type="primary" @click="$router.back()">返回</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentComponent = ref<any>(null);

onMounted(async () => {
  console.log('Plugin page mounted:', route.name, route.params);
  
  // 根据 component_name 动态加载组件
  if (route.name === 'dvadmin3_flow') {
    try {
      const module = await import('./dvadmin3_flow/index.vue');
      currentComponent.value = module.default;
      console.log('dvadmin3_flow component loaded');
    } catch (error) {
      console.error('Failed to load dvadmin3_flow:', error);
    }
  }
});
</script>

<style scoped lang="scss">
.plugins-container {
  height: 100%;
  padding: 20px;
}

.plugin-not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>