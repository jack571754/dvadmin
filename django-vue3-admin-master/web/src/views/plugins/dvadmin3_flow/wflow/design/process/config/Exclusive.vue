<script setup>
import {computed} from "vue";
import nodeMixin from "../NodeMixin";
import ConditionGroupConfig from "./common/ConditionGroupConfig.vue";
import {ElMessage} from "element-plus";

const props = defineProps({
  ...nodeMixin.props
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))



function delGroup(i) {
  if (_value.value.props.groups.length < 2){
    ElMessage.warning('哥，给我留一个😥')
    return
  }
  _value.value.props.groups.splice(i, 1)
}

function addGroup() {
  if (_value.value.props.groups.length >= 4){
    ElMessage.warning('不要搞这么多撒🤨')
    return
  }
  _value.value.props.groups.push({
    logic: true, //组内条件关系
    conditions: []
  })
}

</script>

<template>
  <el-form>
    <el-form-item label="条件组关系" v-if="_value.props.groups.length > 1">
      <el-radio-group v-model="_value.props.logic">
        <el-radio label="全部满足" :value="true"></el-radio>
        <el-radio label="满足任意一个" :value="false"></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-button style="margin-bottom: 20px;" link type="primary" icon="Plus" @click="addGroup">添加条件组</el-button>
    <condition-group-config v-model="_value.props.groups[i]"  :designData="designData" :name="`条件组 ${i + 1}`" :key="i"
                            v-for="(group, i) in _value.props.groups" @delete="delGroup(i)"/>
  </el-form>
</template>

<style scoped>

</style>
