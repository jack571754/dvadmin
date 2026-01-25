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
  <el-form-item label="输入范围">
    <el-input type="number" style="width: 47%;" v-model="config.props.min" placeholder="最小值"/>
    ~
    <el-input type="number" style="width: 47%;" v-model="config.props.max" placeholder="最大值"/>
  </el-form-item>
  <el-form-item label="步长">
    <el-input type="number" v-model="config.props.step" placeholder="步长"/>
  </el-form-item>
  <el-form-item label="小数位">
    <el-input type="number" v-model="config.props.decimalPlaces" placeholder="小数位"/>
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
