<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed} from "vue";

const props = defineProps({
  ...FormComponentMixin.props,
})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))

const type = computed(() => {
  switch (props.config.props.format) {
    case 'YYYY':
      return 'year'
    case 'YYYY-MM':
      return 'month'
    case 'YYYY-MM-DD':
      return 'date'
    case 'YYYY-MM-DD HH:mm':
      return 'datetime'
    default:
      return 'datetime'
  }
})
</script>

<template>
  <el-date-picker v-model="_value" :value-format="config.props.format" :format="config.props.format"
                  clearable :type="type" :placeholder="config.props.placeholder"/>
</template>

<style scoped>

</style>
