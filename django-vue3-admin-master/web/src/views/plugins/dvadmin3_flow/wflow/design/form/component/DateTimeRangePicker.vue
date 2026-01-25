<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed} from "vue";

const props = defineProps({
  ...FormComponentMixin.props
})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))

const type = computed(() => {
  switch (props.config.props.format) {
    case 'YYYY-MM-DD':
      return 'daterange'
    case 'YYYY-MM-DD HH:mm':
      return 'datetimerange'
    default:
      return 'daterange'
  }
})

</script>

<template>
  <el-date-picker v-model="_value" clearable :value-format="config.props.format"
                  :format="config.props.format" :type="type"
                   :start-placeholder="config.props.placeholder[0]"
                  :end-placeholder="config.props.placeholder[1]"/>
</template>

<style scoped>

</style>
