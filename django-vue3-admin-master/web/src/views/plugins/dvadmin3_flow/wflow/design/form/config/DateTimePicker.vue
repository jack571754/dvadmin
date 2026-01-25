<script setup>
import FormComponentMixin from "../FormComponentMixin";

const props = defineProps({
  ...FormComponentMixin.props
})

const emit = defineEmits([...FormComponentMixin.emits])


</script>

<template>
  <el-form-item label="字段KEY">
    <el-input v-model="config.key" placeholder="请输入字段唯一key值"/>
  </el-form-item>
  <el-form-item label="字段名称">
    <el-input v-model="config.name" placeholder="请设置字段名称"/>
  </el-form-item>
  <el-form-item label="提示文字">
    <el-input v-model="config.props.placeholder" placeholder="输入提示"/>
  </el-form-item>
  <el-form-item label="数据格式">
    <el-select v-model="config.props.format">
      <el-option label="年-月" value="YYYY-MM"/>
      <el-option label="年-月-日" value="YYYY-MM-DD"/>
      <el-option label="年-月-日 时" value="YYYY-MM-DD HH"/>
      <el-option label="年-月-日 时:分" value="YYYY-MM-DD HH:mm"/>
    </el-select>
  </el-form-item>
  <el-form-item label="隐藏名称">
    <el-switch v-model="config.props.hideLabel"/>
  </el-form-item>
  <el-form-item label="是否必填">
    <el-switch v-model="config.props.required"/>
  </el-form-item>
  <el-form-item label="表格列显示">
    <el-switch v-model="config.columnShow"/>
  </el-form-item>
</template>

<style lang="less" scoped>

</style>
