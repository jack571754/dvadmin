<template>
	<el-dialog v-model="dialogVisible" :title="title" width="500" :close-on-click-modal="false">
		<span>
			<el-form ref="ruleFormRef" style="max-width: 600px" :model="formData" label-width="auto"
				class="demo-ruleForm" status-icon>
				<el-form-item v-for="item in formItems" :label="item.label" :prop="item.prop" :rules="item.rules">
					<el-input v-if="item.type === 'input'" v-model="formData[item.prop]" v-bind="item.attr" />
					<el-input v-if="item.type === 'textarea'" v-model="formData[item.prop]" style="width: 400px"
						:autosize="{ minRows: 4, maxRows: 10 }" type="textarea" v-bind="item.attr" />
				</el-form-item>
			</el-form>
		</span>
		<template #footer>
			<div class="dialog-footer">
				<el-button v-if="isShowCancle" @click="dialogVisible = false">{{ cancleText }}</el-button>
				<el-button type="primary" @click="submit(ruleFormRef)">
					{{ submitText }}
				</el-button>
			</div>
		</template>
	</el-dialog>
	<el-button :type="type" @click="click">{{ title }}</el-button>
</template>
<script setup>
import { ref } from 'vue';
import request from "../../api/request";
import {ElMessage} from "element-plus";
const props = defineProps({
	title: {
		type: String,
		default: '版本管理'
	},
	type: {
		type: String,
		default: 'primary'
	},
	isShowCancle: {
		type: Boolean,
		default: true
	},
	cancleText: {
		type: String,
		default: '取消'
	},
	submitText: {
		type: String,
		default: '提交'
	},
	configType: {
		type: String,
		default: 'click' // showForm | click
	},
  auditType:{
    type: String,
    default: 'pass'
  },
  rowData:{
    type: Object,
    default: () => ({})
  },
	formItems: {
		type: Array,
		default: () => ([
      {
        label: '审核意见',
        prop: 'reason',
        type: 'textarea',
        rules: [
          { required: true, message: '请输入审核意见' },
        ],
        attr: {
          placeholder: '请输入审核意见'
        }
      },
		])
	},
});
const formData = ref({});
const dialogVisible = ref(false);
const emits = defineEmits(['submit', 'clickFn', 'audit_pass', 'audit_reject']);
const ruleFormRef = ref();
const submit = (ruleFormRef) => {
	ruleFormRef.validate((valid) => {
		if (valid) {
      if(props.auditType === 'pass'){
        if(props.rowData.flow_data_id){
          request({
            url: `/api/dvadmin3_flow/flow_data/${props.rowData.flow_data_id}/handle_pass/`,
            method: 'post',
            data: formData.value,
          }).then((res) => {
            ElMessage.success('审核通过');
            dialogVisible.value = false;
            emits('clickFn', formData.value)
          });
        }else{
          emits('audit_pass',formData.value)
        }

      }
      if(props.auditType === 'reject'){
        if(props.rowData.flow_data_id){
          request({
            url: `/api/dvadmin3_flow/flow_data/${props.rowData.flow_data_id}/handle_reject/`,
            method: 'post',
            data: formData.value,
          }).then((res) => {
            ElMessage.success('审核驳回');
            dialogVisible.value = false;
            emits('clickFn', formData.value)
          });
        }else {
          emits('audit_reject',formData.value)
        }

      }
		}
	});
};
const click = () => {
	if(props.configType !== 'showForm') return emits('clickFn');
	dialogVisible.value = true
};
defineExpose({
  dialogVisible
});
</script>

<style scoped lang="less"></style>
