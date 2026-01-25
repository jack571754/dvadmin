<script setup>
import FormComponentMixin from "../FormComponentMixin";

const props = defineProps({
  ...FormComponentMixin.props
})

const emit = defineEmits([...FormComponentMixin.emits])

const keyOptions = [
  {value: 'name', label: '姓名',},
  {value: 'mobile', label: '手机号',},
  {value: 'IDCard', label: '身份证号',},
]

const rulesOptions = [
  {value: '/^[A-Za-z]+$/', label: '纯字母输入',},
  {value: '/^[A-Za-z0-9]+$/', label: '数字与字母组合',},
  {value: '/^1[3-9]\\d{9}$/', label: '手机号',},
  {value: '/^(0\\d{2,3}-?\\d{7,8})(-?\\d{1,4})?$/', label: '电话号码',},
  {value: '/^[a-zA-Z\u4e00-\u9fa5]+$/', label: '中文或英文字母',},
  {value: '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/', label: '邮箱',},
  {value: '/^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$/i', label: 'URL',},
  {value: '/^[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$/i', label: '身份证号',},
]
</script>

<template>
  <el-form-item label="字段KEY">
    <el-select
    v-model="config.key"
    filterable
    placeholder="请输入字段唯一key值"
    allow-create
    clearable
    default-first-option
    style="width: 240px"
  >
    <el-option
      v-for="item in keyOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
  </el-form-item>
  <el-form-item label="字段名称">
    <el-input v-model="config.name" placeholder="请设置字段名称"/>
  </el-form-item>
  <el-form-item label="提示文字">
    <el-input v-model="config.props.placeholder" placeholder="输入提示"/>
  </el-form-item>
  <el-form-item label="校验规则">
    <el-select
      v-model="config.props.rules"
      filterable
      clearable
      allow-create
      multiple
      default-first-option
      placeholder="请选择校验规则"
      style="width: 240px"
    >
      <el-option
        v-for="item in rulesOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
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
