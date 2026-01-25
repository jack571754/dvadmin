<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed} from "vue";

const props = defineProps({
  ...FormComponentMixin.props,

})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))
</script>

<template>
  <el-input show-word-limit :rows="3" type="textarea" v-model="_value"
            :maxlength="config.props.max || 255"
            :placeholder="config.props.placeholder"/>
</template>

<style scoped>

</style>
