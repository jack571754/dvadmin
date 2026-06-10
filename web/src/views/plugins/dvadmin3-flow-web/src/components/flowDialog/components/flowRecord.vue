<script setup lang="ts">

import {computed, ref} from "vue";

const props = defineProps({
  status: Number,
  modelValue: Object
})

const objData = computed(()=>{
  return props.modelValue
})

const setTaskModeType = (type: string) => {
  const typeDict = {
    OR:'或签'
  }
  return typeDict[type]
}

const setIcon = (status:Number)=>{
  return status==1?'Check':'More'
}
const setType = (status:Number) => {
  return status==1?'success':'warning'
}

const auditActiveName = ref('1')
const setAuditCollapseName = (objIndex,index)=>{
  return `${objIndex}-${index}`
}
</script>

<template>
  <div style="padding-left:10px ; ">
  <el-timeline>
    <el-timeline-item :timestamp="item.create_datetime" placement="top"  size="large" :icon="setIcon(item.nodeStatus)"  :type="setType(item.nodeStatus)"  v-for="(item,objIndex) in objData">
      <el-card>
        <template #header>
          <div class="header-title">
            <span>{{item.nodeData.name}}</span>
          </div>
          <div style="margin-top: 5px" v-if="item.nodeData.node_type=='Approval'">
            <span>审批模式</span>
            <el-tag>{{setTaskModeType(item.nodeData.props.taskMode.type)}}</el-tag>
          </div>
        </template>
        <div v-if="item.nodeData.node_type=='Start'">
          {{item.startUserName}}(发起流程)
        </div>
        <div v-if="item.nodeData.node_type=='Approval'">
          <div class="flex justify-start gap-3">
            <div>审核人员({{item.preInfo.pre_user.length}}人):</div>
            <div v-for="user in item.preInfo.pre_user">
              <span>{{user.name}}</span>
            </div>
          </div>
          <div class=" mt-2.5">
            <div>审核完成({{item.auditUsers.length}}人):</div>
            <div>
              <el-collapse v-model="auditActiveName" accordion>
                <el-collapse-item v-for="(user,index) in item.auditUsers"  :name="setAuditCollapseName(objIndex,index)">
                  <template #title="{ isActive }">
                    <div>
                      <el-tag type="success">{{user.name}}</el-tag>
                    </div>
                  </template>
                  <div>
                    {{user.description}}
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
        <div v-if="item.nodeData.node_type=='Cc'">
          <div class="flex justify-start gap-3 mt-2.5">
            <div>抄送({{item.nodeData.props.assignUser.length}}人):</div>
            <div v-for="user in item.nodeData.props.assignUser">
              <el-tag type="success">{{user.name}}</el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </el-timeline-item>
<!--    <el-timeline-item timestamp="2024/12/12" placement="top"  size="large" icon="More" type="warning">-->
<!--      <el-card>-->
<!--        <template #header>-->
<!--          <div class="header-title">-->
<!--            <span>审核人</span>-->
<!--          </div>-->
<!--          <div>2人审批(会签)</div>-->
<!--        </template>-->
<!--        <div>-->
<!--          <div class="flex justify-start gap-3">-->
<!--            <div>-->
<!--              <el-tag type="success">猿小天(完成)</el-tag>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </el-card>-->
<!--    </el-timeline-item>-->
    <el-timeline-item v-if="props.status==0" timestamp="" placement="top"  size="large" icon="loading" type="warning">
      <div>
        进行中
      </div>
    </el-timeline-item>
    <el-timeline-item v-if="props.status==1" timestamp="" placement="top"  size="large" icon="check" type="success">
      <div>
        审批通过
      </div>
    </el-timeline-item>
  </el-timeline>
  </div>
</template>

<style scoped lang="less">
.header-title{
  font-size: 1.2em;
  color: #686868;
}
</style>