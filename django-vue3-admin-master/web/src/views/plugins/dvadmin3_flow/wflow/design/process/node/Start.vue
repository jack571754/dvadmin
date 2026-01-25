<script setup>
import Node from "./base/Node.vue";
import {computed, ref} from "vue";
import nodeMixin from "../NodeMixin";

const props = defineProps({
  ...nodeMixin.props
})

const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))
const showErr = ref(false)
const errInfo = ref(null)

defineExpose({ validate })
function validate(err){

}
</script>

<template>
<node v-model="_value" :readonly="readonly" :show-close="false" :show-error="showErr"
      @select="emit('select', modelValue)" :error-info="errInfo"
      @insert-node="type => emit('insertNode', branch, index, type)"
      header-color="#80929C" header-icon="UserFilled" content="流程从本节点开始"/>
</template>

<style scoped>

</style>
