<script setup>
import {computed, ref,onMounted} from "vue";
import nodeMixin from "../NodeMixin";
import WOrgPicker from "../../../common/WOrgPicker.vue";
import FormPermConf from "../../../admin/config/FormPermConf.vue";
import WOrgTags from "../../../common/WOrgTags.vue";
import request from "../../../../api/request";

const props = defineProps({
  ...nodeMixin.props
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))

const orgPicker = ref()
const orgPickerType = ref('org')
//选中的组织架构属性
const selectedOrg = ref([])

const modes = {
  USER: {label: '人工审批', type: 'USER', desc: null, color: ''},
  AUTO_REFUSE: {label: '自动拒绝', type: 'AUTO_REFUSE', desc: '📢 将会自动驳回流程', color: 'danger'},
  AUTO_PASS: {label: '自动通过', type: 'AUTO_PASS', desc: '📢 将会自动通过流程', color: 'success'}
}
//审批规则类型定义
const types = [
  {label: '指定人员', type: 'ASSIGN_USER'},
  // {label: '发起人自选', type: 'ROOT_SELECT'},
  {label: '发起人自己', type: 'ROOT_SELF'},
  // {label: '部门主管', type: 'LEADER'},
  {label: '指定部门', type: 'ASSIGN_DEPT'},
  // {label: '逐级部门主管', type: 'LEADER_TOP'},
  // {label: '指定部门主管', type: 'ASSIGN_DEPT'},
  {label: '系统角色', type: 'ASSIGN_ROLE'},
  {label: '动态函数', type: 'CUSTOM_FUNCTION'}
]

function showOrgPicker(orgs, type) {
  orgPickerType.value = type
  selectedOrg.value = orgs
  orgPicker.value.open()
}

function selectOk(orgs) {
  console.log('选中', orgs)
  orgPicker.value.close()
  selectedOrg.value.length = 0
  selectedOrg.value.push(...orgs)
}


// 自定义函数
const workFlowList = ref([])
const getWorkFlow = () => {
  request({
    url: '/api/dvadmin3_flow/flow_info/get_approval_function_list/',
    method: 'get',
  })
    .then(res => {
      if (Array.isArray(res?.data)) {
        workFlowList.value = res.data
        return
      }
      if (Array.isArray(res?.data?.data)) {
        workFlowList.value = res.data.data
        return
      }
      if (Array.isArray(res)) {
        workFlowList.value = res
        return
      }
      workFlowList.value = []
    })
    .catch(() => {
      workFlowList.value = []
    })
}
onMounted(()=>{
  getWorkFlow()
})
</script>

<template>
  <el-tabs style="padding:0px 10px">
    <el-tab-pane label="审批人设置">
<!--      <div style="margin-bottom: 15px">-->
<!--        <el-radio-group v-model="_value.props.mode">-->
<!--          <template v-for="mode in modes">-->
<!--            <el-radio :label="mode.label" :value="mode.type"/>-->
<!--          </template>-->
<!--        </el-radio-group>-->
<!--        <el-text style="display:block; margin: 10px" :type="modes[_value.props.mode].color"-->
<!--                 v-if="modes[_value.props.mode].desc">-->
<!--          {{ modes[_value.props.mode].desc }}-->
<!--        </el-text>-->
<!--      </div>-->
      <el-form label-position="top" v-if="_value.props.mode === 'USER'">
        <div class="w-node-rules">
          <el-text>👨‍⚖️ 设置审批人规则</el-text>
          <div>
            <el-radio-group v-model="_value.props.ruleType" class="w-a-t-group">
              <el-radio v-for="type in types" :key="type.type" :label="type.label" :value="type.type"/>
            </el-radio-group>
            <el-divider style="margin: 5px 0 10px"/>
            <template v-if="_value.props.ruleType === 'ASSIGN_USER'">
              <el-button style="margin-bottom: 5px" @click="showOrgPicker(_value.props.assignUser, 'user')"
                         size="small" type="primary" icon="plus" plain>添加审批人
              </el-button>
              <w-org-tags v-model="_value.props.assignUser"/>
            </template>
            <el-form-item v-else-if="_value.props.ruleType === 'ROOT_SELECT'" label="选择方式">
              <el-radio-group v-model="_value.props.rootSelect.multiple">
                <el-radio :value="false" label="自选一个人"></el-radio>
                <el-radio :value="true" label="自选多个人"></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-text v-else-if="_value.props.ruleType === 'ROOT_SELF'">
              发起人自己将作为审批人进行审批
            </el-text>
            <template v-else-if="_value.props.ruleType === 'LEADER'">
              <el-form-item label="指定主管级别">
                <el-text>发起人的：</el-text>
                <el-select style="width: 80%;" v-model="_value.props.leader.level">
                  <el-option :value="1" label="向上第1级部门主管（直属主管）"></el-option>
                  <el-option v-for="i in 18" :value="i + 1" :label="`向上第${i + 1}级部门主管`"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="对应部门主管未设置时">
                <el-radio-group v-model="_value.props.leader.emptySkip">
                  <el-radio :value="false" label="也算找了一级"></el-radio>
                  <el-radio :value="true" label="有人才算找了一级"></el-radio>
                </el-radio-group>
              </el-form-item>
            </template>
            <template v-else-if="_value.props.ruleType === 'LEADER_TOP'">
              <el-form-item label="部门层级终点">
                <el-radio-group v-model="_value.props.leaderTop.toEnd">
                  <el-radio :value="true" label="直到最顶级部门"></el-radio>
                  <el-radio :value="false" label="到指定级别为止"></el-radio>
                </el-radio-group>
                <el-input-number style="margin-left: 10px" size="small" :precision="0"
                                 v-if="!_value.props.leaderTop.toEnd" v-model="_value.props.leaderTop.level" :min="1"
                                 :max="50"/>
              </el-form-item>
              <el-form-item label="对应部门主管未设置时">
                <el-radio-group v-model="_value.props.leaderTop.emptySkip">
                  <el-radio :value="false" label="也算找了一级"></el-radio>
                  <el-radio :value="true" label="有人才算找了一级"></el-radio>
                </el-radio-group>
              </el-form-item>
            </template>
            <template v-else-if="_value.props.ruleType === 'ASSIGN_DEPT'">
              <el-button style="margin-bottom: 5px" @click="showOrgPicker(_value.props.assignDept.dept, 'dept')"
                         size="small"
                         type="primary" icon="plus" plain>选择部门
              </el-button>
              <w-org-tags v-model="_value.props.assignDept.dept"/>
            </template>
            <template v-else-if="_value.props.ruleType === 'ASSIGN_ROLE'">
              <el-button style="margin-bottom: 5px" @click="showOrgPicker(_value.props.assignRole, 'role')" size="small"
                         type="primary" icon="plus" plain>选择系统角色
              </el-button>
              <w-org-tags v-model="_value.props.assignRole"/>
            </template>
            <template v-else-if="_value.props.ruleType === 'CUSTOM_FUNCTION'">
              <div>
                <el-form-item label="绑定审批人流程函数" style="margin-top: 20px">
                  <el-select v-model="_value.props.customFunction">
                    <el-option
                        v-for="item in workFlowList"
                        :label="item.label"
                        :value="item.value"
                    />
                  </el-select>
                  <el-button type="text" @click="getWorkFlow">刷新</el-button>
                </el-form-item>
              </div>
            </template>
          </div>
        </div>
        <el-form-item label="👩‍👦‍👦节点存在多个审批人时审批方式">
          <el-radio-group v-model="_value.props.taskMode.type">
<!--            <el-radio value="NEXT" label="顺序会签，按匹配顺序依次审批（需所有人同意）"></el-radio>-->
<!--            <el-radio value="AND" label="并行会签，可同时处理（需所有人同意）"></el-radio>-->
            <el-radio style="width: 100%;" value="OR" label="或签（有一人同意即可）"></el-radio>
<!--            <el-radio value="CUSTOM" label="自定义通过比例 %"></el-radio>-->
            <el-input-number v-if="_value.props.taskMode.type === 'CUSTOM'" size="small" :precision="0"
                             v-model="_value.props.taskMode.percentage" :max="100" :min="1"/>
          </el-radio-group>
        </el-form-item>
<!--        <el-form-item label="👤当审批人为空时">-->
<!--          <el-radio-group v-model="_value.props.noUserHandler.type">-->
<!--            <el-radio value="TO_NEXT" label="自动通过"></el-radio>-->
<!--            <el-radio value="TO_REFUSE" label="自动拒绝"></el-radio>-->
<!--&lt;!&ndash;            <el-radio value="TO_ADMIN" label="转交管理员"></el-radio>&ndash;&gt;-->
<!--            <el-radio value="TO_USER" label="转交指定人员"></el-radio>-->
<!--          </el-radio-group>-->
<!--          <template v-if="_value.props.noUserHandler.type === 'TO_USER'">-->
<!--            <el-button style="margin: 10px 0" @click="showOrgPicker(_value.props.noUserHandler.assigned, 'user')"-->
<!--                       size="small" type="primary" icon="plus" plain>选择转交人员-->
<!--            </el-button>-->
<!--            <w-org-tags v-model="_value.props.noUserHandler.assigned"/>-->
<!--          </template>-->
<!--        </el-form-item>-->
        <el-form-item label="🤫当审批人与提交人为同一人时">
          <el-radio-group v-model="_value.props.sameRoot.type">
            <el-radio value="TO_SELF" label="自己审批"></el-radio>
<!--            <el-radio value="TO_LEADER" label="转给直属主管"></el-radio>-->
            <el-radio value="TO_SKIP" label="跳过任务"></el-radio>
          </el-radio-group>
        </el-form-item>
<!--        <el-form-item label="✍ 审批同意时是否需要签字">-->
<!--          <el-radio-group v-model="_value.props.needSign">-->
<!--            <el-radio :value="true" label="需要签字"></el-radio>-->
<!--            <el-radio :value="false" label="无需签字"></el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-divider>扩展设置</el-divider>-->
<!--        <el-form-item label="⏱ 审批限时处理">-->
<!--          <div>-->
<!--            <el-checkbox label="开启审批限时处理" v-model="_value.props.timeout.enable"/>-->
<!--            <template v-if="_value.props.timeout.enable">-->
<!--              <div style="margin: 10px 0">-->
<!--                <el-text style="margin-right: 20px;">时长限制</el-text>-->
<!--                <el-input style="width: 180px;" :min="1" type="number" v-model="_value.props.timeout.time">-->
<!--                  <template #append>-->
<!--                    <el-select style="width: 75px;" v-model="_value.props.timeout.timeUnit">-->
<!--                      <el-option value="M" label="分钟"/>-->
<!--                      <el-option value="H" label="小时"/>-->
<!--                      <el-option value="D" label="天"/>-->
<!--                    </el-select>-->
<!--                  </template>-->
<!--                </el-input>-->
<!--              </div>-->
<!--              <el-form-item label="超时后执行动作">-->
<!--                <el-radio-group v-model="_value.props.timeout.type">-->
<!--                  <el-radio value="TO_PASS" label="自动同意"></el-radio>-->
<!--                  <el-radio value="TO_REFUSE" label="自动拒绝"></el-radio>-->
<!--                  <el-radio value="NOTIFY" label="发催办提醒"></el-radio>-->
<!--                </el-radio-group>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </div>-->
<!--        </el-form-item>-->
      </el-form>

    </el-tab-pane>
<!--    <el-tab-pane lazy label="表单权限设置">-->
<!--      <form-perm-conf default-perm="R" :formItems="formItems" v-model="_value.props.formPerms"/>-->
<!--    </el-tab-pane>-->
    <w-org-picker ref="orgPicker" :type="orgPickerType" :selected="selectedOrg" multiple @ok="selectOk"/>
  </el-tabs>
</template>

<style lang="less" scoped>
:deep(.w-a-t-group) {
  display: flex;
  flex-wrap: wrap;

  .el-radio {
    width: 112px;
    margin-bottom: 10px;
  }
}

.w-node-rules {
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  margin-bottom: 20px;

  & > :first-child {
    display: inline-block;
    padding: 5px;
    width: 100%;
    background-color: var(--el-border-color);
  }

  & > :nth-child(2) {
    padding: 10px;
  }
}
</style>
