<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed, ref} from "vue";

const props = defineProps({
  ...FormComponentMixin.props
})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))


const  validateIDCard = (rule, value, callback)=>{
  const regex = /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if(value==="" || value===null || value===undefined){
    callback()
  }else if (regex.test(value)) {
    callback()
  } else {
    callback(new Error("请输入正确的身份证格式"))
  }
}

const rules = ref([
    { validator: validateIDCard, trigger: "blur" }
])


const handleInput = ()=>{
  emit('onBlur')
}

</script>

<template>
  <el-form-item  :rules="rules" :prop="config.key" >
    <el-input :placeholder="config.props.placeholder" v-model="_value" @blur="handleInput" />
  </el-form-item>

</template>

<style scoped>

</style>
