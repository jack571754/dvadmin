<script setup>
import {computed, onMounted, reactive, ref, getCurrentInstance} from "vue";
import FromDesigner from "../design/form/FormDesigner.vue";
import ProcessDesigner from "./ProcessDesigner.vue";
import BaseSetting from "./BaseSetting.vue";
import PlusSetting from "./PlusSetting.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import WDialog from "../common/WDialog.vue";
import request from '../../api/request'
import nodeType from "../design/process/ProcessNodes"
import { Icon as iconify } from '@iconify/vue';

const _this = getCurrentInstance()
const active = ref('BASE')
const validVisible = ref(false)
//几个设置页面的ref
const validIndex = ref(0)
const baseRef = ref()
const formRef = ref()
const processRef = ref()
const plusRef = ref()
const validRefs = ref([
  {_ref: 'baseRef', name: '基础设置', status: ''},
  // {_ref: 'form', name: '表单设计', status: ''},
  {_ref: 'processRef', name: '流程设计', status: ''},
  // {_ref: 'plus', name: '扩展设置', status: ''}
])
//校验结果
const validResult = ref({})

const activePd = computed(() => {
  return active.value === 'PROCESS'
})

const validIcon = computed(() => {
  if (!validResult.value.finished) {
    return 'loading'
  } else if (validResult.value.success) {
    return 'success'
  } else {
    return 'warning'
  }
})
//错误信息
const errTitle = computed(() => {
  if (validResult.value.finished && !validResult.value.success) {
    return (validResult.value.title + ` (${validResult.value.errs.length}项错误)`)
  }
  return validResult.value.title
})

const props = defineProps({
  modelValue:Object
})

//设计器数据
const designDataInit = reactive({
  name: '未命名流程',
  icon: {
    name: 'file-icons:omnigraffle',
    bgc: '#4C87F3',
    color: '#FFFFFF'
  },
  groupId: null,
  model_type:0,
  content_type:null,
  correlation_model_name:null,
  rule_status:1,
  operation:null,
  formConf: {
    conf: {
      labelPosition: 'right',//标签位置
      labelWidth: 100,//标签宽度，
      size: 'default'
    },
    components: []
  },
  //流程json
  process: [nodeType.Start.create(),nodeType.End.create()],
  remark: null,
  exclude_fields:[],
  enter_fields:[],
})

const designData = computed(()=>{
  return props.modelValue || designDataInit
})

function switchMenu(index) {
  active.value = index
}

function doSave(publish = false) {
	return request({
		url: `/api/dvadmin3_flow/flow_info/`,
		method: 'post',
		data: {
      ...designData.value,
      form_conf:designData.value.formConf
    },
	}).then((res) => {
    ElMessage.success('保存成功');
		// 提交发布
		if (publish) {
			request({
				url: '/api/dvadmin3_flow/flow_info/' + designData.value.id + '/publish/',
				method: 'post',
				data: {},
			}).then((res) => {
				ElMessage.success('发布成功');
			});
		}
	});
}

//分步校验流程表单设计
async function validate() {
  validVisible.value = true
  validIndex.value = 0
  validResult.value = {
    errs: [],
    finished: false,
    success: false,
    title: '检查中...',
    action: '去处理',
    desc: '正在检查设置项',
  }
  validRefs.value.forEach(v => v.status = '')
  for (let i = 0; i < validRefs.value.length; i++) {
    validIndex.value = i
    //阻塞一下
    await new Promise((resolve) => setTimeout(resolve, 500));
    await _this.refs[validRefs.value[validIndex.value]._ref].validate()
    validRefs.value[validIndex.value].status = 'success'
  }
}

function publish() {
  validate().then(() => {
    reloadValidResult(true)
  }).catch(errs => {
    reloadValidResult(false)
    validRefs.value[validIndex.value].status = 'error'
    console.log(errs)
    if (Array.isArray(errs)) {
      validResult.value.errs.push(...errs)
    }
  })
}
//重置校验结果
function reloadValidResult(isSuccess){
  validResult.value.finished = true
  validResult.value.success = isSuccess
  validResult.value.desc = ''
  validResult.value.action = isSuccess ? '去发布' : '去处理'
  validResult.value.title = isSuccess ? '校验成功😃' : '校验失败😥，发现'
  validRefs.value[validIndex.value].status = isSuccess ? 'success' : 'error'
}

function doAfter() {
  if (validResult.value.success) {
    doSave(true)
    validVisible.value = false
  } else {
    active.value = validRefs.value[validIndex.value]._ref.toUpperCase()
    validVisible.value = false
  }
}

//关闭流程设计
const onClose = () => {
  ElMessageBox.confirm('确定关闭流程设计？',{
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(()=>{
    _this.emit('onClose')
  }).catch(()=>{
    ElMessage.error('已取消')
  })
}

</script>

<template>
  <div class="w-designer">
    <el-container>
      <el-header style="padding: 0">
        <el-menu :default-active="active" class="w-designer-menu" mode="horizontal" @select="switchMenu">
          <div>
            <el-button icon="ArrowLeft" circle  @click="onClose"></el-button>
            <iconify :icon="designData.icon.name" class="w-process-icon"
                     :style="{'background': designData.icon.bgc, color: designData.icon.color}"/>
            <el-text>{{ designData.name }}</el-text>
          </div>
          <el-menu-item index="BASE">基础设置</el-menu-item>
          <el-menu-item index="FORM" v-if="designData.model_type===1">表单设计</el-menu-item>
          <el-menu-item index="PROCESS">流程设计</el-menu-item>
<!--          <el-menu-item index="PLUS">④ 扩展设置</el-menu-item>-->
          <div>
            <el-button icon="FolderChecked" @click="doSave()" round>保存</el-button>
            <el-button icon="Promotion" type="primary" @click="publish" round>发布</el-button>
          </div>
        </el-menu>
      </el-header>
      <el-main :class="{'w-designer-container': true, 'w-no-padding': active === 'FORM'}">
        <base-setting ref="baseRef" v-model="designData" v-show="active === 'BASE'"/>
        <from-designer ref="formRef" v-model="designData.formConf" v-if="active === 'FORM'"/>
        <process-designer ref="processRef" :formItems="designData.formConf.components" v-model="designData.process" :designData="designData"
                          :active="activePd" v-show="active === 'PROCESS'" />
        <plus-setting ref="plusRef" v-model="designData" v-show="active === 'PLUS'"/>
      </el-main>
    </el-container>
    <w-dialog :border="false" v-model="validVisible" width="550" title="表单流程设计校验" :show-footer="false">
      <el-steps align-center :active="validIndex" finish-status="success">
        <el-step v-for="(step, i) in validRefs" :title="step.name" :key="i" :icon="step.icon" :status="step.status"
                 :description="step.description"/>
      </el-steps>
      <el-result :icon="validIcon" :title="errTitle" :subTitle="validResult.desc">
        <template #icon>
          <el-icon size="30" class="is-loading" v-if="!validResult.finished">
            <Loading/>
          </el-icon>
        </template>
        <template #sub-title>
          <el-scrollbar v-if="validResult.errs.length > 0">
            <div class="w-valid-err-info">
              <el-text tag="div" truncated v-for="(err, i) in validResult.errs" :key="i + '_err'">
                <el-icon>
                  <Warning/>
                </el-icon>
                {{ err }}
              </el-text>
            </div>
          </el-scrollbar>
        </template>
        <template #extra>
          <el-button type="primary" v-if="validResult.finished" @click="doAfter">
            {{ validResult.action }}
          </el-button>
        </template>
      </el-result>
    </w-dialog>
  </div>

</template>

<style lang="less" scoped>
@import "../../assets/theme";
.w-designer {
  background: #f3f3f3;

  .w-designer-menu {
    display: flex;
    align-items: center;
    background: white;
    justify-content: center;
    position: relative;

    & > div:first-child {
      position: absolute;
      left: 20px;
      display: flex;
      align-items: center;

      .w-process-icon {
        margin: 0 10px 0 20px;
      }
    }

    & > div:last-child {
      position: absolute;
      right: 20px;
    }
  }

  .w-designer-container {
    overflow: auto;
    height: calc(100vh - 60px);
  }

  .w-no-padding {
    padding: 0;
  }
}

.w-valid-err-info {
  max-height: 200px;
  & > div {
    display: block;
    text-align: left;
    padding: 2px 5px;
    border-radius: 5px;
    margin: 2px;
    background: #f3f3f3;
  }
}

.el-menu.el-menu--horizontal {
  border-bottom: none !important;
  width: 100% !important;
  .el-menu-item,
  .el-sub-menu__title {
    height: 50px !important;
    color: var(--el-menu-text-color);
  }
  .el-menu-item:not(.is-active):hover,
  .el-sub-menu:not(.is-active):hover .el-sub-menu__title {
    color: var(--el-menu-text-color);
  }
}
</style>
