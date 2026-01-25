<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {VueDraggable} from "vue-draggable-plus";
import FormComponent from "./FormComponent.vue";
import {computed, onBeforeMount, ref, watch} from "vue";

const props = defineProps({
  ...FormComponentMixin.props,
  modelValue: {
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits([...FormComponentMixin.emits])
const _active = computed(FormComponentMixin.computed._active(props, emit))
const _value = computed(FormComponentMixin.computed._value(props, emit))

const freeMode = computed(() => props.mode === 'free')

function reloadSpan() {
  //初始化分栏数据值
  const spanProps = props.config.props
  if (spanProps.number > spanProps.columns.length) {
    for (let i = 0; i < spanProps.number; i++) {
      console.log(i, spanProps.columns[i])
      if (!spanProps.columns[i]) {
        spanProps.columns.push([])
      }
    }
  } else {
    spanProps.columns.length = spanProps.number
  }
}

onBeforeMount(reloadSpan)
watch(() => props.config.props.number, reloadSpan)
</script>

<template>
  <el-row :gutter="config.props.gutter">
    <el-col v-for="(cols, i) in config.props.columns" :span="config.props.span / config.props.number" :key="`col_${i}`">
      <vue-draggable v-model="config.props.columns[i]" :animation="150" group="FormDesign" :disabled="!freeMode"
                     :ghostClass="freeMode ? 'w-f-cp-select':''" :class="{'w-f-cp-ct':freeMode}">
        <template :key="item.id" v-for="(item, idx) in cols">
          <el-form-item :label="item.name" :required="item.props.required" :prop="item.key" v-if="!item.props.isContainer" @click.stop="_active = item"
                        :class="{'w-form-d-item': freeMode, 'w-form-cp-active': _active?.id === item.id && freeMode,
                         'w-form-cp-nlb':item.props.hideLabel}">
            <form-component :index="idx" :parents="cols" :config="item"
                            :mode="mode" v-model:active="_active" v-model="_value[item.key]" :type="item.type"/>
          </el-form-item>
          <form-component v-else :config="item" :mode="mode" v-model:active="_active" :type="item.type"
                     @click.stop="_active = item" v-model="_value" :index="idx" :parents="cols"
                     :class="{'w-form-d-item': freeMode, 'w-form-cp-active': _active?.id === item.id && freeMode}"/>
        </template>
      </vue-draggable>
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
@import "../../../../assets/theme.less";
:deep(.w-f-cp-ct) {
  width: 100%;
  min-height: 50px;
  background-color: @main-bgc;
}

.w-f-cp-select {
  border-radius: 2px;
  border: 1px dashed var(--el-color-primary) !important;
}
</style>
