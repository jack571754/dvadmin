<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {VueDraggable} from "vue-draggable-plus";

const props = defineProps({
  ...FormComponentMixin.props
})

const emit = defineEmits([...FormComponentMixin.emits])

function addOption() {
  props.config.props.options.push(`选项${props.config.props.options.length + 1}`)
}

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
  <el-form-item label="选项设置">
    <el-button style="margin: 7px" link type="primary" icon="plus" @click="addOption">添加选项</el-button>
    <vue-draggable class="w-fd-options" handle=".w-move" :animation="150" v-model="config.props.options">
      <el-input v-for="(option, i) in config.props.options" v-model="config.props.options[i]">
        <template #prepend>
          <el-icon class="w-move">
            <Rank/>
          </el-icon>
        </template>
        <template #append>
          <el-button icon="Delete" @click="config.props.options.splice(i, 1)"/>
        </template>
      </el-input>
    </vue-draggable>
  </el-form-item>
  <el-form-item label="选项展开">
    <el-switch v-model="config.props.expanding"/>
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
:deep(.w-fd-options) {
  .el-input-group__append, .el-input-group__prepend {
    padding: 0 10px;
  }
}

.w-move {
  cursor: move;
}
</style>
