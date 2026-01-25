<script setup>
import {computed, ref} from "vue";
import nodeMixin from "../NodeMixin";
import FormPermConf from "../../../admin/config/FormPermConf.vue";
import WOrgTags from "../../../common/WOrgTags.vue";
import WOrgPicker from "../../../common/WOrgPicker.vue";

const props = defineProps({
  ...nodeMixin.props
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))

const orgPicker = ref()
const orgPickerType = ref('org')
//选中的组织架构属性
const selectedOrg = ref([])
//抄送规则类型定义
const types = [
  {label: '指定人员', type: 'ASSIGN_USER'},
  // {label: '发起人自选', type: 'ROOT_SELECT'},
  // {label: '直属主管', type: 'LEADER'},
  {label: '指定部门', type: 'ASSIGN_DEPT'},
  // {label: '指定部门', type: 'ASSIGN_DEPT'},
  {label: '系统角色', type: 'ASSIGN_ROLE'}
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
</script>

<template>
  <el-tabs>
    <el-tab-pane label="抄送人设置">
      <el-form label-position="top">
        <div class="w-node-rules">
          <el-text>👨‍⚖️ 设置抄送人规则</el-text>
          <div>
            <el-radio-group v-model="_value.props.ruleType" class="w-a-t-group">
              <el-radio v-for="type in types" :key="type.type" :label="type.label" :value="type.type"/>
            </el-radio-group>
            <el-divider style="margin: 5px 0 10px"/>
            <template v-if="_value.props.ruleType === 'ASSIGN_USER'">
              <el-button style="margin-bottom: 5px" @click="showOrgPicker(_value.props.assignUser, 'user')"
                         size="small" type="primary" icon="plus" plain>添加抄送人
              </el-button>
              <w-org-tags v-model="_value.props.assignUser"/>
            </template>
            <el-form-item v-else-if="_value.props.ruleType === 'ROOT_SELECT'" label="选择方式">
              <el-radio-group v-model="_value.props.rootSelect.multiple">
                <el-radio :value="false" label="自选一个人"></el-radio>
                <el-radio :value="true" label="自选多个人"></el-radio>
              </el-radio-group>
            </el-form-item>
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
            <template v-else-if="_value.props.ruleType === 'LEADER'">
              <el-text>抄送发起人的直属主管</el-text>
            </template>
          </div>
        </div>
      </el-form>
    </el-tab-pane>
    <el-tab-pane lazy label="表单权限设置">
      <form-perm-conf default-perm="R" :formItems="formItems" v-model="_value.props.formPerms"/>
    </el-tab-pane>
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
