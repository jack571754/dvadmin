<script lang="ts" setup>
import {computed, ref} from "vue";
import H5Previewer from "./Previewer.vue";
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  formItems: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const emit = defineEmits(['update:modelValue'])
const _value = computed(() => props.formItems)

const dialogShow = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const closeDialog = () => {
  emit('update:modelValue',false)
}

const formRules = ref({})

</script>

<template>
  <el-dialog v-model="dialogShow" title="H5预览" width="450" destroy-on-close @close="closeDialog">
    <div id="h5preview" style="width: 375px;height: 667px;border: 1px solid #ccc;border-radius: 10px;box-shadow: 0px 1px 3px 2px #000;padding:0px 10px;position: relative">
      <H5Previewer :form-items="_value" ></H5Previewer>
    </div>

  </el-dialog>
</template>

<style scoped lang="scss">

</style>