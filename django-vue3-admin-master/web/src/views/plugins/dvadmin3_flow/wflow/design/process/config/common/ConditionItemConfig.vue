<script setup>
import {computed, ref} from "vue";
import WOrgTags from "../../../../common/WOrgTags.vue";
import WOrgPicker from "../../../../common/WOrgPicker.vue";
import {CompareOptions} from "../../../../../utils/ConditionCompare";

const props = defineProps({
  type: {
    type: String
  },
  modelValue: {
    type: Object
  }
})

const _value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
defineEmits(['update:modelValue'])

const orgPicker = ref()
const isNull = ref(false)
const pickerType = ref('org')

function setIsNull(val) {
  val = 'null'
}

function addOrg(type) {
  pickerType.value = type
  orgPicker.value.open()
}

function selectOk(orgs) {
  _value.value.compareVal = orgs
  orgPicker.value.close()
}

</script>

<template>
  <div>
    <!-- 基础条件选项 -->
    <el-select v-model="_value.compare" style="width: 30%;">
      <el-option v-for="op in CompareOptions[type]" :key="op.symbol" :label="op.name" :value="op.symbol"/>
    </el-select>
    <el-divider direction="vertical"/>
    <!--每类条件选项-->
    <template v-if="type === 'org'">
      <el-button icon="Plus" size="small" type="primary" round @click="addOrg('org')">选择人员/部门</el-button>
      <w-org-tags style="margin-top: 5px" v-model="_value.compareVal"/>
    </template>
    <template v-else-if="type === 'role'">
      <el-button icon="Plus" size="small" type="primary" round @click="addOrg('role')">选择角色</el-button>
      <w-org-tags style="margin-top: 5px" v-model="_value.compareVal"/>
    </template>
    <template v-if="type === 'user'">

    </template>
    <template v-else-if="type === 'dept'">

    </template>
    <template v-else-if="type === 'number'">
      <template v-if="_value.compare === 'BT'">
        <el-input style="width: 30%;" type="number" v-model="_value.compareVal[0]" placeholder="左比较值"></el-input>
        ~
        <el-input style="width: 30%;" type="number" v-model="_value.compareVal[1]" placeholder="右比较值"></el-input>
      </template>
      <el-select v-else-if="_value.compare === 'IN'" multiple filterable allow-create
                 v-model="_value.compareVal" style="width: 65%;" placeholder="请输入选项">
        <el-option v-for="op in _value.compareVal" :key="op.symbol" :label="op.name" :value="op.name"/>
      </el-select>
      <el-input v-else type="number" style="width: 65%;" v-model="_value.compareVal[0]" placeholder="比较值"/>
    </template>
    <template v-else-if="type === 'string'">
      <el-select v-if="_value.compare === 'IN'" multiple filterable allow-create
                 v-model="_value.compareVal" style="width: 65%;" placeholder="请输入选项">
        <el-option v-for="op in _value.compareVal" :key="op.symbol" :label="op.name" :value="op.name"/>
      </el-select>
      <el-input style="width: 55%;" v-else v-model="_value.compareVal[0]" placeholder="输入比较值"/>
      <span style="width: 10%;margin-left: 10px;">
        <el-checkbox label="为空" size="large" v-model="isNull" @click="setIsNull(_value.compareVal[0])"/>
      </span>
    </template>
    <template v-else-if="type === 'boolean'">
      <el-select  v-model="_value.compareVal[0]" style="width: 65%;" placeholder="请输入选项">
        <el-option v-for="op in [{label:'是',value:'true'},{label:'否',value:'false'}]"  :label="op.label" :value="op.value"/>
      </el-select>
    </template>
    <template v-else-if="type === 'array'">

    </template>
    <template v-else-if="type === 'date'">

    </template>
    <template v-else-if="type === 'dateRange'">

    </template>
    <w-org-picker :type="pickerType" multiple ref="orgPicker" :selected="_value.compareVal" @ok="selectOk"/>
  </div>
</template>

<style scoped lang="less">

</style>
