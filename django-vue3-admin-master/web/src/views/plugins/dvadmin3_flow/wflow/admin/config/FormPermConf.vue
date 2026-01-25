<script setup>
import {computed, onBeforeMount, ref, watch} from "vue";
import nodeMixin from "../../design/process/NodeMixin";
import {getFormPermFields} from "../../design/FormInterface";

const props = defineProps({
  ...nodeMixin.props,
  showE: {
    default: true
  },
  defaultPerm: { //默认加载的字段权限
    default: 'R'
  }
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))
const permSelect = ref('R')
const updateKey = ref(1)
const formFields = ref([])

//加载的时候判断，赋默认值
onBeforeMount(() => {
  if (!_value.value){
    _value.value = []
  }
  permSelect.value = props.defaultPerm;
  //提取所有的字段及字段权限列表
  formFields.value = getFormPermFields(props.defaultPerm);
  //加载之前的权限
  (props.modelValue || []).forEach(v => {
    const i = formFields.value.findIndex(fv => fv.key === v.key)
    if (i > -1 && v.perm){
      formFields.value[i].perm = v.perm
    }
  })
})

function allSelect(perm) {
  formFields.value.forEach(v => v.perm = perm)
  updateKey.value ++
}

//权限变化后，反馈给绑定的值
watch(formFields, () => {
  _value.value = formFields.value.map(v => {
    return {id: v.id, key: v.key, perm: v.perm}
  })
}, {deep: true})

</script>

<template>
  <el-table :key="updateKey" :header-cell-style="{ background: '#f5f6f6' }" :data="formFields" border style="width: 100%">
    <template #empty>
      未解析到表单字段清单😥
    </template>
    <el-table-column prop="title" show-overflow-tooltip label="表单字段">
      <template v-slot="scope">
        <span v-if="scope.row.props?.required" style="color: var(--el-color-danger)"> * </span>
        <span>{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column align="center" prop="readOnly" label="只读" width="80">
      <template #header="scope">
        <el-radio label="R" v-model="permSelect" @change="allSelect('R')">只读</el-radio>
      </template>
      <template v-slot="scope">
        <el-radio v-model="scope.row.perm" value="R" :name="scope.row.id"></el-radio>
      </template>
    </el-table-column>
    <el-table-column align="center" prop="editable" label="可编辑" width="90" v-if="showE">
      <template #header="scope">
        <el-radio label="E" v-model="permSelect" @change="allSelect('E')">可编辑</el-radio>
      </template>
      <template v-slot="scope">
        <el-radio v-model="scope.row.perm" value="E" :name="scope.row.id"></el-radio>
      </template>
    </el-table-column>
    <el-table-column align="center" prop="hide" label="隐藏" width="80">
      <template #header="scope">
        <el-radio label="H" v-model="permSelect" @change="allSelect('H')">隐藏</el-radio>
      </template>
      <template v-slot="scope">
        <el-radio v-model="scope.row.perm" value="H" :name="scope.row.id"></el-radio>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="less">

</style>
