<script setup>
import {VueDraggable} from 'vue-draggable-plus'
import {components, FormComponentConfigs} from "../form/FormComponents";
import {computed, onMounted, ref, watch} from "vue";
import componentMixin from "./FormComponentMixin";
import {ElMessageBox} from "element-plus";
import FormRender from "./FormRender.vue";
import previewDialog from "../../../flowH5/previewDialog.vue"
import WDialog from "../../common/WDialog.vue";
import FormComponent from "./component/FormComponent.vue";
import {generateStr, deepCopy} from "../../../utils/GlobalFunc";
import {formJson} from "../FormInterface";
import { Icon as iconify } from '@iconify/vue';

//保存编辑历史
const history = []

const pcMode = ref(true)
const showTip = ref(true)
const active = ref({})
const previewVisible = ref(false)
const previewH5Visible = ref(false)
const formData = ref({})

defineExpose({validate})
const props = defineProps({
  ...componentMixin.props,
  modelValue: {
    type: Object,
    default: () => {
      return {
        formConfig: {
          labelPosition: 'right',//标签位置
          labelWidth: 100,//标签宽度，
          size: 'default'
        },
        components: []
      }
    }
  }
})
const emit = defineEmits([...componentMixin.emits])
const _value = computed(componentMixin.computed._value(props, emit))
const _showTip = computed(() => {
  return showTip.value && _value.value.components.length === 0
})
//初始化设置表单数据
onMounted(() => {
  formJson.value = _value.value.components
})

watch(() => _value.value.components, () => {
  formJson.value = _value.value.components
}, {deep: true})

function onClone(el) {
  const clone = JSON.parse(JSON.stringify(el))
  clone.key = clone.type + '_' + generateStr(8)
  clone.id = 'wflow_' + clone.key
  return clone
}

function addHis(v) {
  history.push(v)
  if (history.length >= 50) {
    history.splice(0, 1)
  }
}

function onChoose(ev) {
  //activeKey.value = ev.oldIndex
  console.log(ev)
}

function _onChoose(cp) {
  active.value = cp
  console.log("cp", cp)
}

function clearForm() {
  ElMessageBox.confirm('您确定要清空表单设计区吗?', '提醒', {
    confirmButtonText: '我再想想',
    cancelButtonText: '确认清空',
    type: 'warning',
  }).catch(() => {
    addHis(deepCopy(_value.value.components))
    _value.value.components.length = 0
  })
}

function previewForm() {
  previewVisible.value = true
}

function previewH5Form() {
  previewH5Visible.value = true
}

function validate() {
  return new Promise((resolve, reject) => {
    if (_value.value.components.length > 0) {
      resolve()
    } else {
      reject(['表单组件为空'])
    }
  })
}

</script>

<template>
  <el-container class="w-form-designer">
    <el-aside width="300px" class="w-form-d-lib">
      <div class="w-cp-lib">
        <div>组件库</div>
        <div>
          <div v-for="(group, gi) in components" :key="gi" class="w-cp-group">
            <div>{{ group.name }}</div>
            <vue-draggable v-model="group.components"
                           :group="{ name: 'FormDesign', pull: 'clone', put: false }"
                           :sort="false" :clone="onClone" class="w-cp-items">
              <div v-for="(formCp, ci) in group.components" :key="formCp.type" class="w-cp-item">
                <iconify :icon="formCp.icon"/>
                <span>{{ formCp.name }}</span>
              </div>
            </vue-draggable>
          </div>
        </div>
      </div>
    </el-aside>
    <el-container style="display:flex; flex-direction: column">
      <div class="w-form-d-toolbar">
        <div>
          <el-tooltip effect="dark" content="撤销" placement="top">
            <iconify icon="ooui:undo-ltr"/>
            <!--            <el-text type="warning">撤销</el-text>-->
          </el-tooltip>
          <el-tooltip effect="dark" content="重做" placement="top">
            <iconify icon="ooui:undo-rtl"/>
            <!--            <el-text type="danger">重做</el-text>-->
          </el-tooltip>
        </div>
        <div>
          <el-tooltip effect="dark" content="电脑端" placement="top">
            <iconify icon="mi:computer" :class="{'w-f-d-t-active': pcMode}"/>
          </el-tooltip>
          <el-tooltip effect="dark" content="手机端" placement="top">
            <iconify icon="mingcute:cellphone-line" :class="{'w-f-d-t-active': !pcMode}"/>
          </el-tooltip>
        </div>
        <div>
          <el-tooltip effect="dark" content="清空设计" placement="top">
            <div @click="clearForm">
              <iconify icon="fluent:delete-12-regular"/>
              <span>清除</span>
            </div>
          </el-tooltip>
          <el-tooltip effect="dark" content="预览PC端" placement="top">
            <div @click="previewForm">
              <iconify icon="fluent:delete-12-regular"/>
              <span style="color: #0d84ff">PC端</span>
            </div>
          </el-tooltip>
          <el-tooltip effect="dark" content="预览H5端" placement="top">
            <div @click="previewH5Form">
              <iconify icon="fluent:delete-12-regular"/>
              <span style="color: #0d84ff">H5端</span>
            </div>
          </el-tooltip>
        </div>
      </div>
      <el-form :label-width="_value.conf.labelWidth" :label-position="_value.conf.labelPosition"
               :size="_value.conf.size" class="w-form-d-ctx">
        <vue-draggable v-model="_value.components" :animation="150" ghostClass="w-f-cp-select"
                       @choose="onChoose" @add="showTip = false" @remove="showTip = true"
                       group="FormDesign" class="w-form-d-ctx-ep">
          <template v-for="(cp, i) in _value.components" :key="cp.id">
            <el-form-item :label="cp.name" :required="cp.props.required" v-if="!cp.props.isContainer"
                          @click="_onChoose(cp)"
                          :class="{'w-form-d-item': true, 'w-form-cp-active': active?.id === cp.id,
                          'w-form-cp-nlb':cp.props.hideLabel}">
              <form-component :index="i" :parents="_value.components" mode="free" :type="cp.type" :config="cp"
                              v-model:active="active"/>
            </el-form-item>
            <form-component v-else :type="cp.type" class="w-form-d-item" :index="i" :parents="_value.components"
                            :config="cp" v-model:active="active" @click="_onChoose(cp)" mode="free"
                            :class="{'w-form-d-item': true, 'w-form-cp-active': active?.id === cp.id}"/>
          </template>
        </vue-draggable>
        <div class="w-form-d-tip" v-if="_showTip">
          <span>💕 请从左侧组件库拖拽表单组件到此处</span>
        </div>
      </el-form>
    </el-container>
    <el-aside width="300px" class="w-form-d-conf">
      <el-form label-width="80">
        <el-tabs stretch>
          <el-tab-pane label="组件设置" v-if="active">
            <div style="padding: 10px">
              <component :is="FormComponentConfigs[active.type]" :config="active"/>
            </div>
          </el-tab-pane>
          <el-tab-pane label="表单设置">
            <div style="padding: 10px">
              <el-form-item label="标签位置">
                <el-radio-group v-model="_value.conf.labelPosition">
                  <el-radio-button label="上面" value="top"/>
                  <el-radio-button label="靠左" value="left"/>
                  <el-radio-button label="靠右" value="right"/>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="标签宽度">
                <el-input type="number" v-model="_value.conf.labelWidth"></el-input>
              </el-form-item>
              <el-form-item label="组件尺寸">
                <el-radio-group v-model="_value.conf.size">
                  <el-radio-button label="大" value="large"/>
                  <el-radio-button label="中" value="default"/>
                  <el-radio-button label="小" value="small"/>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-aside>
    <w-dialog v-model="previewVisible" width="800px" title="表单预览"
              :border="false" ok-text="表单校验" cancel-text="关闭">
      <form-render :config="_value" v-model="formData"/>
    </w-dialog>
    <previewDialog v-model="previewH5Visible" :form-items="_value"></previewDialog>
  </el-container>
</template>

<style lang="less" scoped>

@tool-nav-height: 35px;

.w-form-designer {
  font-size: var(--el-font-size-base);
  color: var(--el-text-color);
}

.w-form-d-lib {
  border-right: 1px solid var(--el-border-color);
}

:deep(.w-form-d-conf) {
  border-left: 1px solid var(--el-border-color);

  .el-tabs__header {
    background-color: white;

    .el-tabs__nav {
      height: calc(@tool-nav-height);
    }

    .el-tabs__item {
      font-size: small;
      height: calc(@tool-nav-height);
    }
  }
}

.w-cp-lib, .w-cp-conf {
  font-size: small;

  & > div:first-child {
    height: @tool-nav-height;
    line-height: @tool-nav-height;
    text-align: center;
    background: white;
  }

  & > div:last-child {
    padding: 0 15px;
  }
}

.w-cp-group {
  & > div:first-child {
    padding: 15px 0;
  }

  .w-cp-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.w-cp-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: white;
  width: 110px;
  border: 1px solid white;
  margin-bottom: 5px;
  color: var(--el-text-color-primary);

  & > span {
    margin-left: 5px;
  }

  &:hover {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    cursor: grab;
  }
}

.w-form-d-toolbar {
  display: flex;
  height: @tool-nav-height;
  align-items: center;
  background: white;
  position: relative;
  padding: 0 20px;

  .w-f-d-t-active {
    color: #656363;
  }

  & > div {
    color: #989898;
    font-size: medium;

    & > * {
      padding: 2px;
      margin: 0 5px;
      cursor: pointer;

      &:focus {
        outline: none;
      }

      &:hover {
        color: #656363;
      }
    }
  }

  & > div:nth-child(2) {
    margin-left: 20px;
  }

  & > div:nth-child(3) {
    font-size: small;
    position: absolute;
    right: 20px;
    display: flex;

    & > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 5px;
      }
    }

    & > div:first-child {
      color: var(--el-color-danger);
    }

    & > div:last-child {
      color: var(--el-color-primary);
    }
  }
}

.w-form-d-ctx {
  margin: 10px;
  padding: 5px;
  position: relative;
  background-color: white;
  border-radius: 5px;
  min-height: calc(100vh - 125px);

  .w-form-d-tip {
    padding: 20px;
    color: #8d8d8d;
    position: relative;
    display: flex;
    justify-content: center;

    span {
      position: absolute;
      top: -25vh;
    }
  }

  :deep(.w-form-d-ctx-ep) {
    min-height: 80%;
  }
}

.w-f-cp-select {
  border-radius: 2px;
  border: 1px dashed var(--el-color-primary) !important;
}
</style>
