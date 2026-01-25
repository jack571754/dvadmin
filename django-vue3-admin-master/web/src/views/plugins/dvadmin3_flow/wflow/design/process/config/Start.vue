<script setup>
import {computed} from "vue";
import nodeMixin from "../NodeMixin";
import FormPermConf from "../../../admin/config/FormPermConf.vue";

const props = defineProps({
  ...nodeMixin.props
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))

</script>

<template>
  <el-tabs>
    <el-tab-pane lazy label="表单权限设置">
      <form-perm-conf default-perm="E" :formItems="formItems" v-model="_value.props.formPerms"/>
    </el-tab-pane>
  </el-tabs>

</template>

<style scoped>

</style>
