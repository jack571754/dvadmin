<script setup>
import FormComponentMixin from "../FormComponentMixin";

const props = defineProps({
  ...FormComponentMixin.props
})

const emit = defineEmits([...FormComponentMixin.emits])


</script>

<template>
  <div>
    <el-form-item label="字段KEY">
      <el-input v-model="config.key" placeholder="请输入字段唯一key值"/>
    </el-form-item>
    <el-form-item label="分栏数">
      <el-select v-model="config.props.number">
        <el-option label="分2栏" :value="2"></el-option>
        <el-option label="分3栏" :value="3"></el-option>
        <el-option label="分4栏" :value="4"></el-option>
        <el-option label="分6栏" :value="6"></el-option>
        <el-option label="分8栏" :value="8"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="栏间隔">
      <el-input v-model="config.props.gutter" type="number" placeholder="每栏间隔多少"/>
    </el-form-item>
  </div>
</template>

<style lang="less" scoped>

</style>
