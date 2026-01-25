<script setup>
import {computed, nextTick, ref, watch} from "vue";
import InsertBtn from "./InsertBtn.vue";
import nodeMixin from "../../NodeMixin";

const props = defineProps({
  moveLn: Boolean,
  moveRn: Boolean,
  type: String, //节点类型
  color: String, //节点主题颜色
  headerIcon: String, //头部图标
  content: String, //节点内容
  readonly: Boolean, //是否禁用，不可编辑
  modelValue: Object, //节点名称
  showError: Boolean, //是否显示错误状态
  errorInfo: String, //错误信息
  isDefault: Boolean, //是否为默认节点
  placeholder: {
    default: '请设置'
  },
  desc: String //描述
})
const enableEdit = ref(false)
const nodeNameInput = ref()
const emit = defineEmits([...nodeMixin.emits, 'copy', 'moveL', 'moveR'])
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
    <div :class="{'w-p-node-body': true, 'w-node-err': showError}" :style="{'---shadowColor': color}">
      <div class="w-p-node-move" @click="emit('moveL')">
        <el-icon v-show="!readonly && moveLn && !isDefault">
          <ArrowLeft/>
        </el-icon>
      </div>
      <div style="flex: 1">
        <div class="w-p-node-header">
          <div :style="{'color': isDefault ? '#898989' : color}">
            <el-icon size="15" v-if="!enableEdit">
              <component :is="headerIcon"/>
            </el-icon>
            <input ref="nodeNameInput" v-if="enableEdit" autofocus @blur="enableEdit = false" v-model="_value.name"/>
            <div class="w-row-text" v-else @click="() => {if(!readonly) enableEdit = true}">{{ _value.name }}</div>
          </div>
          <div class="w-node-action" v-if="!readonly && !isDefault">
            <el-icon @click="emit('copy')">
              <CopyDocument/>
            </el-icon>
            <el-icon @click="emit('delete')">
              <Close/>
            </el-icon>
          </div>
          <el-text class="w-node-desc" type="info" size="small">{{ desc }}</el-text>
        </div>
        <div class="w-p-node-content" @click="$emit('select')">
          <el-text line-clamp="4">{{ content || placeholder }}</el-text>
        </div>
      </div>
      <div class="w-p-node-move" @click="emit('moveR')">
        <el-icon v-show="!readonly && moveRn && !isDefault">
          <ArrowRight/>
        </el-icon>
      </div>
    </div>
    <div class="w-p-node-add">
      <insert-btn v-if="!readonly" @insertNode="nd => emit('insertNode', nd)"/>
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 0 5px 0 #d8d8d8;

    .w-p-node-move {
      width: 15px;

      &:hover {
        background: #F5F6F6;
      }
    }

    &:hover {
      box-shadow: 0 0 5px 0 var(---shadowColor);
    }

    & > div:first-child, & > div:last-child {
      height: 100%;

      &:hover {
        background: @node-line-color;
      }
    }

    .w-p-node-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 25px;
      font-size: 13px;

      .w-node-action {
        color: #767676;
        display: none;

        & > * {
          margin: 2px;
        }
      }

      .w-node-desc {
        position: absolute;
        right: 8px;
      }

      .w-row-text {
        &:hover {
          text-decoration: underline;
        }
      }

      & > div {
        display: flex;
        align-items: center;

        & > div {
          margin-left: 3px;
          width: calc(@node-width - 85px);
        }
      }

      input {
        width: calc(@node-width - 85px);
        border: 1px solid @node-line-color;
        border-radius: 5px;

        &:focus {
          outline: none;
        }
      }
    }

    .w-p-node-content {
      padding: 5px;
      min-height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      color: #656363;

      & > div {
        word-wrap: break-word;
      }
    }

    &:hover {
      .w-node-action {
        display: inline;
      }

      .w-node-desc {
        display: none;
      }
    }
  }

  .w-p-node-add {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: @node-line-len;

    &:before {
      position: absolute;
      content: '';
      width: 2px;
      height: @node-line-len;
      background: @node-line-color;
    }

    &:after {
      content: '';
      position: absolute;
      top: @node-line-len;
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
