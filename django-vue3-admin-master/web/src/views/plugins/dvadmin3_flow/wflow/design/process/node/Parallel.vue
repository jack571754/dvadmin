<script setup>

import {computed, ref} from "vue";
import BranchNode from "./base/BranchNode.vue";
import nodeMixin from "../NodeMixin";

const props = defineProps({
  ...nodeMixin.props,
  moveLn: Boolean,
  moveRn: Boolean
})
const emit = defineEmits([...nodeMixin.emits, 'moveL', 'moveR'])
const _value = computed(nodeMixin.computed._value(props, emit))

defineExpose({ validate })
function validate(err){
  return true
}

</script>

<template>
  <branch-node v-model="_value" :readonly="readonly" desc="并行执行"
               color="#718dff" header-icon="Operation"
               content="并行流程分支" :moveRn="moveRn" :moveLn="moveLn"
               @insertNode="type => emit('insertNode', type)"
               @move-l="emit('moveL')" @move-r="emit('moveR')"
               @delete="emit('delete')" @select="emit('select', modelValue)"/>
</template>

<style scoped>

</style>
