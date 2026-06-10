<script setup lang="ts">
import request from "../api/request"
import {onMounted, ref} from "vue";
import dialogForm from './components/dialogForm.vue'
import dialogCrud from './components/dialogCrud/index.vue'
import flowH5Preview from "./components/flowH5Preview/index.vue"
const flowList = ref([])
const getFlowList = () => {
  request.get('/api/dvadmin3_flow/flow_info/flow_list/').then(res => {
    flowList.value = res.data
  })
}

const operationOptions = {
  "create":"新增",
  "update":"编辑",
  "delete":"删除",
}

onMounted(() => {
  getFlowList()
})

const dialogVisible = ref(false)
const flowInfo = ref()
const onSelect = (item) => {
  dialogVisible.value = true
  flowInfo.value = item
}

const dialogTableVisible = ref(false)
const onView = (item) => {
  dialogTableVisible.value = true
  flowInfo.value = item
}

</script>

<template>
 <div>
   <el-empty v-if="flowList.length===0" description="暂无数据" />
   <el-row :gutter="20">
     <el-col :span="4" v-for="item in flowList" style="margin-top: 10px">
       <el-card >
         <template #header>
           <div class="card-header">
             <span>{{item.name}}</span>
           </div>
         </template>
         <div>
           <el-descriptions
               :column="1"

           >
             <el-descriptions-item label="流程类型">
               <el-tag :type="item.model_type===1?'success':'primary'">{{item.model_type===1?'动态表单':'数据库表'}}</el-tag>
             </el-descriptions-item>
             <el-descriptions-item label="数据库表">
               <el-tag>{{item.model_name || '-'}}</el-tag>
             </el-descriptions-item>
             <el-descriptions-item label="库表操作">
              <el-tag> {{operationOptions[item.operation] || '-'}}</el-tag>
             </el-descriptions-item>
           </el-descriptions>
         </div>
        <template #footer>
          <div>
            <el-button type="text" v-if="item.model_type===1" @click="onSelect(item)">发起流程</el-button>
            <el-button type="text" @click="onView(item)">查看数据</el-button>
            <flowH5Preview :flowId="item.id"></flowH5Preview>
          </div>
        </template>
       </el-card>
     </el-col>
   </el-row>
   <dialogForm   v-model:dialogVisible="dialogVisible" v-model:flowInfo="flowInfo"></dialogForm>
   <dialogCrud  v-model:dialogVisible="dialogTableVisible" v-model:flowInfo="flowInfo"></dialogCrud>
 </div>
</template>

<style scoped lang="scss">

</style>