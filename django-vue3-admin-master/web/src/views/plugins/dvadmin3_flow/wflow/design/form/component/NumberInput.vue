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
  <el-input type="number" :max="config.props.max" :min="config.props.min"
            :placeholder="config.props.placeholder"  v-model="_value"></el-input>
</template>

<style scoped>

</style>
