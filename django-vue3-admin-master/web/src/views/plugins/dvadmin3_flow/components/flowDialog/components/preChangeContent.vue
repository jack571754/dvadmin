<script setup lang="ts">
import {computed} from "vue";
import FormRender from "../../../wflow/design/form/FormRender.vue";

const props =  defineProps({
  modelValue: Object
})

const objData = computed(()=>{
  return props.modelValue
})

const filterStatus = (type: string) => {
  if(type==='create'){
    return '新增'
  }else if(type==='update'){
    return '修改'
  }else if(type==='delete'){
    return '删除'
  }
}

</script>

<template>
<div>
  <div v-if="objData.model_type===0">
    <div class="operation-title">操作类型: <el-text class="operation-title" type="primary">{{filterStatus(objData.pre_change_content.type)}} </el-text></div>
    <el-descriptions title="数据信息"  border  :column="2">
      <div v-for="(value,key) in objData.pre_change_content.form_data">
        <el-descriptions-item  v-if="!['申请内容','提交内容'].includes(key)" :label="key">{{value || '-'}}</el-descriptions-item>
      </div>
    </el-descriptions>
    <div v-if="objData.pre_change_content.sub_table">
    <el-divider content-position="left">子表信息</el-divider>
    <el-table border size="small" :data="objData.pre_change_content.sub_table.tableData">
      <el-table-column v-for="item in objData.pre_change_content.sub_table.tableCol" :label="item.label" :prop="item.prop"></el-table-column>
    </el-table>
    </div>
  </div>
  <div  v-if="objData.model_type===1">
    <form-render :config="objData.formConf" mode="disabled" v-model="objData.pre_change_content.formData"/>
  </div>
</div>
</template>

<style scoped lang="scss">
.operation-title{
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>