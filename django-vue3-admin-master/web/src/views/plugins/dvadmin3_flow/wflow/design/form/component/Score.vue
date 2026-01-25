<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed} from "vue";

const props = defineProps({
  ...FormComponentMixin.props,
})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))

const icon = computed(() => {
  const ico = props.config.props.icon
  return [ico, ico, ico]
})

const color = computed(() => {
  const icoColor = props.config.props.color
  return [icoColor, icoColor, icoColor]
})


</script>

<template>
  <el-rate :allow-half="config.props.enableHalf" clearable :void-icon="props.config.props.icon"
           :max="config.props.max" :show-score="config.props.showScore" :text-color="config.props.color"
           v-model="_value" :colors="color" :icons="icon"/>
</template>

<style scoped>

</style>
