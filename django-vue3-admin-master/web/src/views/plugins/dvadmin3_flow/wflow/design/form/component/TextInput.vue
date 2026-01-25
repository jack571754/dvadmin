<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed} from "vue";

const props = defineProps({
  ...FormComponentMixin.props
})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))
</script>

<template>
  <el-input :placeholder="config.props.placeholder" v-model="_value"/>
</template>

<style scoped>

</style>
