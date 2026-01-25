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
  <el-form-item label="图标设置">
    <el-radio-group size="small" v-model="config.props.icon">
      <el-radio-button value="StarFilled">
        <el-icon><StarFilled/></el-icon>
      </el-radio-button>
      <el-radio-button value="View">
        <el-icon><View /></el-icon>
      </el-radio-button>
      <el-radio-button value="UserFilled">
        <el-icon><UserFilled /></el-icon>
      </el-radio-button>
      <el-radio-button value="Medal">
        <el-icon><Medal /></el-icon>
      </el-radio-button>
      <el-radio-button value="Sunny">
        <el-icon><Sunny /></el-icon>
      </el-radio-button>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="最大分值">
    <el-input-number :precision="0" :min="0" :max="20" v-model="config.props.max"/>
  </el-form-item>
  <el-form-item label="显示分值">
    <el-switch v-model="config.props.showScore"/>
  </el-form-item>
  <el-form-item label="允许半分">
    <el-switch v-model="config.props.enableHalf"/>
  </el-form-item>
  <el-form-item label="图标颜色">
    <el-color-picker v-model="config.props.color"/>
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
