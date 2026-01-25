<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {VueDraggable} from "vue-draggable-plus";
import {computed} from "vue";
import {delField, copyField, deepCopy} from "../../../../utils/GlobalFunc";
import FormComponent from "./FormComponent.vue";

const props = defineProps({
  ...FormComponentMixin.props,
  modelValue: {
    type: Array,
    default: () => {
      return []
    }
  }
})

const emit = defineEmits([...FormComponentMixin.emits])
const _active = computed(FormComponentMixin.computed._active(props, emit))
const _value = computed(FormComponentMixin.computed._value(props, emit))
const freeMode = computed(() => props.mode === 'free')

const tbCellStyle = {
  background: '#e8e8e8',
  padding: '10px 0',
}

function ck(column, ev) {
  ev.stopPropagation()
  const active = props.config.props.columns[column.no]
  if (active) {
    emit('update:active', active)
  }
}

function onChoose(ev) {
  const active = props.config.props.columns[ev.oldIndex]
  if (active) {
    _active.value = active
  }
}

function getRow(){
  let row = {}
  props.config.props.columns.forEach(col => row[col.key] = null)
  return row
}

function addRow() {
  emit('update:modelValue', [...(_value.value || []), getRow()])
}

function delRow(i){
  _value.value.splice(i, 1)
}

function copyRow(row){
  _value.value.push(deepCopy(row))
}

</script>

<template>
  <vue-draggable v-model="config.props.columns" target=".w-tb-header-cell" group="FormDesign"
                 filter=".w-tb-op" :animation="150" :disabled="!freeMode"
                 :ghostClass="freeMode ? 'w-f-cp-select': ''" class="w-f-cp-ct">
    <el-table :data="_value" :cell-style="{padding: 0}" header-row-class-name="w-tb-header-cell" border
              :header-cell-style="tbCellStyle"  @header-click="ck">
      <template #empty v-if="freeMode">
        <span>👆拖拽字段到上方列内</span>
      </template>
      <el-table-column ref="col" :prop="col.key" :label="col.name" v-for="(col, i) in config.props.columns" :key="`col_${col.id}`"
                       :class-name="`${mode === 'free' ? 'w-form-d-item':''} ${_active?.id === col.id && freeMode ? 'w-form-cp-active':''}`">
        <template #header>
          <div style="border: none !important;" :class="{'w-form-cp-active': _active?.id === col.id && freeMode}">
            <div class="w-form-component" v-if="mode === 'free'">
              <el-icon color="#ffffff" @click="copyField(config.props.columns, i)"><CopyDocument /></el-icon>
              <el-icon color="#ffffff" @click="delField(config.props.columns, i)"><Delete /></el-icon>
            </div>
            <div>{{col.name}}</div>
          </div>
        </template>
        <template v-slot="scope">
          <form-component :index="i" :parents="config.props.columns" :config="col" :mode="mode" v-model:active="_active"
                          v-model="_value[scope.$index][col.key]" :key="col.id" :type="col.type"/>
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="120" label="操作" @click.native="ck" class-name="w-tb-op" v-if="mode === 'normal'">
        <template #header>
          <span>操作</span>
          <el-button icon="plus" v-if="mode === 'normal'" @click="addRow" circle class="w-tb-op-add"/>
        </template>
        <template v-slot="scope">
          <el-link type="danger" :underline="false" @click="delRow(scope.$index)">删除</el-link>
          <el-divider direction="vertical"/>
          <el-link type="primary" :underline="false" @click="copyRow(scope.row)">复制</el-link>
        </template>
      </el-table-column>
    </el-table>
  </vue-draggable>
</template>

<style lang="less" scoped>
@import "../../../../assets/theme.less";
.w-f-cp-ct {
  width: 100%;
  height: 100%;
  min-height: 50px;
  background-color: @main-bgc;
}

.w-tb-op {
  position: relative;
  .w-tb-op-add {
    position: absolute;
    top: 5px;
    right: 5px;
  }
}

:deep(.w-tb-header-cell) {
  cursor: grab;

  .w-form-d-item {
    position: relative;
    padding: 5px;
    margin: 2px;
    border: 1px dashed white;

    &:hover {
      border: 1px dashed #8d8d8d;
    }
  }

  .w-form-cp-active {
    border: 1px dashed var(--el-color-primary) !important;
  }
}

.w-f-cp-select {
  border-radius: 2px;
  border: 1px dashed var(--el-color-primary) !important;
}

.w-form-component {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 9;
  display: none;
  border-radius: 5px 0 0 0;
  overflow: hidden;

  i {
    padding: 5px;
    cursor: pointer;
    background: var(--el-color-primary);
    &:hover {
      background: var(--el-color-primary-light-3);
    }
  }
}
</style>
