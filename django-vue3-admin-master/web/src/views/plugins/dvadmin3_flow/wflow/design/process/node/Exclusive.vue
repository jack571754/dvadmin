<script setup>

import {computed, ref} from "vue";
import BranchNode from "./base/BranchNode.vue";
import nodeMixin from "../NodeMixin";
import {ProcessCondition} from "../../../../utils/ConditionCompare";

const props = defineProps({
  ...nodeMixin.props,
  moveLn: Boolean,
  moveRn: Boolean,
  isDefault: Boolean
})
const emit = defineEmits([...nodeMixin.emits, 'moveL', 'moveR'])
const _value = computed(nodeMixin.computed._value(props, emit))

const showErr = ref(false)
const errInfo = ref(null)

defineExpose({validate})

const content = computed(() => {
  if (props.isDefault) {
    return '其他情况将进入此分支'
  } else {
    let desc = '请设置条件'
    const prop = _value.value.props
    if (prop.groups.length > 0 && prop.groups[0].conditions.length > 0) {
      desc = prop.groups.map(group => {
        if ((group.conditions || []).length === 0) {
          return '请添加条件'
        }
        const hasMore = prop.groups.length > 1 && group.conditions.length
        return (hasMore ? '[' : '') + group.conditions.map(cd => {
          if (ProcessCondition[cd.group] && ProcessCondition[cd.group][cd.type]) {
            return ProcessCondition[cd.group][cd.type].desc(cd)
          }
          return '未配置条件'
        }).join(` ${group.logic ? '且' : '或'} `) + (hasMore ? ']' : '')
      }).join(` ${prop.logic ? '且' : '或'} `)
    }
    return desc
  }
})

function validate(errs) {
  //校验非默认节点
  showErr.value = true
  if (!props.isDefault){
    const prop = _value.value.props
    if (prop.groups.length === 0) {
      errInfo.value = '请添加条件组'
      errs.push(`条件 ${_value.value.name}未添加条件组`)
      return;
    }else {
      for (let i = 0; i < prop.groups.length; i++) {
        const group = prop.groups[i]
        if (group.conditions.length === 0) {
          errInfo.value = '请给条件组设置条件'
          errs.push(`${_value.value.name}-${group.name}未添加条件`)
          return
        }
        for (const cd of group.conditions) {
          if (!cd.compare || hasEmpty(cd.compareVal || [])){
            errInfo.value = `请完善条件项: ${(cd.name || []).join('-')}`
            errs.push(`${_value.value.name}-条件组${i + 1}内条件未完善`)
            return
          }
        }
      }
    }
  }
  showErr.value = false
}

function hasEmpty(arr){
  return arr.length === 0 || arr.findIndex(v => {
    return v === null || v === undefined || String(v).trim() === ''
  }) > -1
}
</script>

<template>
  <branch-node v-model="_value" :readonly="readonly" :show-error="showErr" :error-info="errInfo"
               color="#59B9A4" header-icon="share" :is-default="isDefault"
               :content="content" :moveRn="moveRn" :moveLn="moveLn"
               @insertNode="type => emit('insertNode', type)" :desc="`优先级 ${index + 1}`"
               @move-l="emit('moveL')" @move-r="emit('moveR')"
               @delete="emit('delete')" @select="emit('select', modelValue)"/>
</template>

<style scoped>

</style>
