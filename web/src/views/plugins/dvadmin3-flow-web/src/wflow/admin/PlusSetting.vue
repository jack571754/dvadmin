<script setup>
defineExpose({validate})
function validate(){
  return new Promise(resolve => resolve())
}

</script>

<template>
  <el-main class="w-designer-base">
    <el-text>暂无设置项</el-text>
  </el-main>
</template>

<style lang="less" scoped>
.w-designer-base {
  margin: 0 auto;
  border-radius: 5px;
  background-color: white;
  width: 800px;
  min-height: calc(100vh - 100px);
}
</style>
