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
  <el-checkbox-group v-if="config.props.expanding" v-model="_value">
    <el-checkbox v-for="(op, i) in config.props.options" :label="op" :value="op"/>
  </el-checkbox-group>
  <el-select multiple v-else v-model="_value">
    <el-option v-for="(op, i) in config.props.options" :label="op" :value="op"/>
  </el-select>
</template>

<style scoped>

</style>
