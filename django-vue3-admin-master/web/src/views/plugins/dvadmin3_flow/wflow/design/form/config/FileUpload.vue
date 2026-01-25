<template>
  <div>
    <el-form-item label="字段KEY">
      <el-input v-model="config.key" placeholder="请输入字段唯一key值"/>
    </el-form-item>
    <el-form-item label="字段名称">
      <el-input v-model="config.name" placeholder="请设置字段名称"/>
    </el-form-item>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="config.props.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="数量限制">
      <template #label>
        <el-tooltip
            effect="dark"
            content="限制最大上传图片数量（为0则不限制）"
            placement="top-start"
        >
          <span>数量限制</span>
        </el-tooltip>
      </template>
      <el-input-number class="max-fill" controls-position="right" :precision="0" size="small" v-model="config.props.maxNumber" placeholder="最多上传几张图片"/>
    </el-form-item>
    <el-form-item label="大小限制">
      <template #label>
        <el-tooltip
            effect="dark"
            content="限制单个文件最大大小-MB（为0则不限制）"
            placement="top-start"
        >
          <span>大小限制</span>
        </el-tooltip>
      </template>
      <el-input-number class="max-fill" controls-position="right" :precision="1" size="small" v-model="config.props.maxSize" placeholder="单个文件最大大小"/>
    </el-form-item>
    <el-form-item label="类型限制">
      <template #label>
        <el-tooltip
            effect="dark"
            content="限制上传文件的后缀类型"
            placement="top-start"
        >
          <span>类型限制</span>
        </el-tooltip>
      </template>
      <el-select size="small" style="width: 100%;" v-model="config.props.fileTypes" multiple
                 filterable allow-create default-first-option clearable placeholder="允许上传文件的后缀格式，可设置多种"/>
    </el-form-item>
    <el-form-item label="不可下载">
      <el-switch v-model="config.props.onlyRead"></el-switch>
    </el-form-item>
  </div>
</template>
<script setup>
import FormComponentMixin from "../FormComponentMixin";

const props = defineProps({
  ...FormComponentMixin.props
})

const emit = defineEmits([...FormComponentMixin.emits])

</script>


<style lang="less" scoped>
/deep/ .el-form-item__label{
  padding: 0 12px 0 0;
}
</style>
