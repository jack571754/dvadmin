<script setup>
import {FormComponents} from "../form/FormComponents";
import componentMixin from "../form/FormComponentMixin";
import {computed} from "vue";

const props = defineProps({
  ...componentMixin.props,
  modelValue: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const emit = defineEmits([...componentMixin.emits])
const _value = computed(componentMixin.computed._value(props, emit))

</script>

<template>
  <el-form :label-width="config.conf.labelWidth" :size="config.conf.size"
           :label-position="config.conf.labelPosition" class="w-form-render" :disabled="['disable','disabled'].includes(mode)">
    <template v-for="(cp, i) in config.components" :key="cp.type + i">
      <el-form-item :label="cp.name" v-if="!cp.props.isContainer" :required="cp.props.required"
                    :class="{'w-form-cp-nlb':cp.props.hideLabel}" :prop="cp.key">
        <component :is="FormComponents[cp.type]" :mode="mode" :config="cp" v-model="_value[cp.key]"/>
      </el-form-item>
      <component v-else :is="FormComponents[cp.type]" :mode="mode" v-model="_value" :config="cp"/>
    </template>
  </el-form>
</template>

<style lang="less" scoped>

</style>
