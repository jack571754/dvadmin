<script setup>
import {computed, nextTick, ref, watch} from "vue";
import InsertBtn from "./InsertBtn.vue";
import nodeMixin from "../../NodeMixin";

const props = defineProps({
  headerColor: String, //头部颜色
  headerIcon: String, //头部图标
  content: String, //节点内容
  readonly: Boolean, //是否禁用，不可编辑
  modelValue: Object, //节点对象,
  showError: Boolean, //是否显示错误状态
  errorInfo: String, //错误信息
  showClose: {
    default: true
  },
  showBody: {
    default: true
  },
  placeholder: {
    default: '请设置'
  }
})

const enableEdit = ref(false)
const nodeNameInput = ref()
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))

watch(enableEdit, () => {
  if (enableEdit.value) {
    nextTick(() => {
      nodeNameInput.value.focus()
    })
  }
})
</script>

<template>
  <div class="w-p-node">
    <el-tooltip v-if="showError" effect="dark" :content="errorInfo || '设置错误'" placement="top-start">
      <el-icon size="20" class="w-node-err-tip">
        <WarningFilled/>
      </el-icon>
    </el-tooltip>
    <div :class="{'w-p-node-body': true, 'w-node-err': showError}" v-if="showBody"
         :style="{'---shadowColor': headerColor}">
      <div class="w-p-node-header" :style="{'background-color': headerColor}">
        <div>
          <el-icon size="15" v-if="!enableEdit">
            <component :is="headerIcon"/>
          </el-icon>
          <input ref="nodeNameInput" style="color: #000" v-if="enableEdit" autofocus @blur="enableEdit = false" v-model="_value.name"/>
          <div class="w-row-text" v-else @click="() => {if(!readonly) enableEdit = true}">{{ _value.name }}</div>
        </div>
        <el-icon class="w-node-del" v-if="showClose && !readonly" @click="emit('delete')">
          <Close/>
        </el-icon>
      </div>
      <div class="w-p-node-content" @click="$emit('select')">
        <el-text line-clamp="4">{{ content || placeholder }}</el-text>
        <el-icon class="w-p-node-click">
          <ArrowRight/>
        </el-icon>
      </div>
    </div>
    <div class="w-p-node-add">
      <insert-btn v-if="!readonly" @insertNode="type => emit('insertNode', type)"/>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "../../../../../assets/theme";
.w-p-node {
  width: @node-width;
  margin-bottom: 8px;
  position: relative;

  .w-node-err-tip {
    position: absolute;
    right: -30px;
    color: var(--el-color-danger)
  }

  .w-p-node-body {
    cursor: pointer;
    background: white;
    overflow: hidden;
    border-radius: 5px;
    box-shadow: 0 0 5px 0 #d8d8d8;

    .w-p-node-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      color: white;
      height: 25px;
      font-size: 13px;

      .w-row-text {
        &:hover {
          text-decoration: underline;
        }
      }

      .w-node-del {
        display: none;
      }

      & > div {
        display: flex;
        align-items: center;

        & > div {
          margin-left: 3px;
          width: calc(@node-width - 50px);
        }
      }

      input {
        width: calc(@node-width - 50px);
        border: none;
        border-radius: 5px;

        &:focus {
          outline: none;
        }
      }
    }

    .w-p-node-content {
      padding: 5px 5px 5px 15px;
      min-height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      color: #656363;

      & > div {
        width: 92%;
        word-wrap: break-word;
      }
    }

    &:hover {
      box-shadow: 0 0 5px 0 var(---shadowColor);

      .w-node-del {
        display: inline;
      }
    }
  }

  .w-p-node-add {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;

    &:before {
      position: absolute;
      content: '';
      width: @node-line-width;
      height: 80px;
      background: @node-line-color;
    }

    &:after {
      content: '';
      position: absolute;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      border-style: solid;
      border-width: 8px 6px 4px;
      border-color: @node-line-color transparent transparent;
    }
  }
}
</style>
