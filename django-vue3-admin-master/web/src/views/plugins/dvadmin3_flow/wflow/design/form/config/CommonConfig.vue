<script setup>
import FormComponentMixin from "../FormComponentMixin";

const props = defineProps({
  ...FormComponentMixin.props
})

const emit = defineEmits([...FormComponentMixin.emits])
</script>

<template>
  <el-form-item label="字段KEY">
    <el-input v-model="config.props.key" placeholder="请输入字段唯一key值"/>
  </el-form-item>
  <el-form-item label="隐藏名称">
    <el-switch v-model="config.props.hideLabel"/>
  </el-form-item>
</template>

<style scoped>

</style>
