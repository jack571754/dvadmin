<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { Check, Close } from '@element-plus/icons-vue';
import flowRecord from './components/flowRecord.vue';
import preChangeContent from './components/preChangeContent.vue';
import ProcessRender from '../../wflow/design/process/ProcessRender.vue';
import request from '../../api/request';
import { ElMessage } from 'element-plus';

const props = defineProps({
	modelValue: Boolean,
	items: Object,
});
const emit = defineEmits(['update:modelValue', 'handleSubmit', 'closed']);

const objData = ref({
	name: '',
	status: 0,
	no: '',
});
const flowVisiable = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit('update:modelValue', val);
	},
});

const getObj = () => {
	request({
		url: `/api/dvadmin3_flow/flow_data/${props.items.id}/`,
		method: 'get',
	}).then((res) => {
		const { data } = res;
		objData.value = data;
	});
};

const activeName = ref('formData');
const zoom = ref(100);
const processData = ref();

const handleVisiable = ref(false);
const handleOpinions = ref();
const handleMode = ref('pass');
const onHandler = (type: string) => {
	handleVisiable.value = true;
	handleMode.value = type;
	handleOpinions.value = '';
};

const setStatus = (val: string) => {
	return [
		{ value: 0, label: '进行中', type: 'primary' },
		{ value: 1, label: '审核通过', type: 'success' },
		{ value: 2, label: '审核驳回', type: 'danger' },
		{ value: 3, label: '审核撤销', type: 'warning' },
	].find((item) => item.value === val);
};

const handleSubmit = () => {
	handleVisiable.value = false;
	if (handleMode.value === 'pass') {
		request({
			url: `/api/dvadmin3_flow/flow_data/${objData.value.id}/handle_pass/`,
			method: 'post',
			data: {
				reason: handleOpinions.value,
			},
		}).then((res) => {
			ElMessage.success('审核通过');
			handleVisiable.value = false;
			getFlowRecord();
			getObj();
		});
	} else {
		request({
			url: `/api/dvadmin3_flow/flow_data/${objData.value.id}/handle_reject/`,
			method: 'post',
			data: {
				reason: handleOpinions.value,
			},
		}).then((res) => {
			ElMessage.success('审核驳回');
			handleVisiable.value = false;
			getFlowRecord();
			getObj();
		});
	}
};

const onClose = () => {
	emit('closed');
};

const changeContent = ref();
// 获取预改变数据
const getPreChangeContent = () => {
	return request({
		url: `/api/dvadmin3_flow/flow_data/${props.items.id}/get_pre_change_content/`,
		method: 'get',
	}).then((res) => {
		const { data } = res;
		changeContent.value = data;
	});
};

const recordList = ref();
//获取流转记录
const getFlowRecord = () => {
	return request({
		url: `/api/dvadmin3_flow/flow_data/${props.items.id}/get_flow_record/`,
		method: 'get',
	}).then((res) => {
		const { data } = res;
		recordList.value = data;
	});
};

// 获取流程图
const getFlowProcess = () => {
	return request({
		url: `/api/dvadmin3_flow/flow_data/${props.items.id}/get_flow_process/`,
		method: 'get',
	}).then((res) => {
		const { data } = res;
		processData.value = data;
	});
};

onMounted(() => {
	getObj();
	getPreChangeContent();
});

const onChangeTab = (tab) => {
	const { name } = tab.props;
	if (name === 'flowImg') {
		getFlowProcess();
	} else if (name === 'flowRecord') {
		getFlowRecord();
	} else if (name === 'formData') {
		getPreChangeContent();
	}
};

// 设置审核按钮
const setHandleBtn = () => {
	const userInfos = sessionStorage.getItem('userInfo');
	const userInfo = JSON.parse(userInfos);
	const userId = userInfo.id;
	const userRole = userInfo.role_info;
	const userDept = userInfo.dept_info;
	const value = objData.value;
	let result = true;
	if (!value) {
		result = false;
	}
	if (value.status !== 0) {
		result = false;
	}
	let user_exists = true;
	const preUser = toRaw(value.pre_user);
	if (typeof userId !== 'number' && typeof userId !== 'string') {
		result = false;
	}
	// 确保 preUser 是数组
	if (Array.isArray(preUser)) {
		user_exists = preUser.some((item) => item.id === userId);
	}
	let role_exists = true;
	const preRole = toRaw(value.pre_role);
	if (Array.isArray(preRole)) {
		const userRoleIdList = userRole.map((item) => item.id);
		role_exists = preRole.some((item) => userRoleIdList.includes(item.id));
	}
	let dept_exists = true;
	const preDept = toRaw(value.pre_dept);
	if (Array.isArray(preDept)) {
		dept_exists = preDept.some((item) => item.id === userDept.dept_id);
	}

	result = result && (user_exists || role_exists || dept_exists);

	return result;
};
const getItems = (data: any,key: string) => {
	try {
		const content = data.pre_change_content.form_data[key].components
		 return content
	} catch (error) { 
		return false
	} 
};
</script>

<template>
	<div v-if="flowVisiable">
		<el-drawer v-model="flowVisiable" title="流程实例详情" size="40%" @close="onClose">
			<div class="flow-dialog">
				<div>
					<span class="flow-dialog-title">{{ objData.name }}</span>
					<el-tag :type="setStatus(objData.status).type">{{ setStatus(objData.status).label }}</el-tag>
				</div>
				<div class="flow-dialog-no">流水号:{{ objData.no }}</div>
				<div>
					<span>{{ objData.start_user_name }}</span>
					<!--    <el-divider direction="vertical" />-->
					<!--    <span>技术部</span>-->
					<el-divider direction="vertical" />
					<span class="flow-dialog-time">提交于 {{ objData.create_datetime }}</span>
				</div>
				<div class="flow-dialog-tabs">
					<el-tabs v-model="activeName" @tab-click="onChangeTab">
						<el-tab-pane label="数据信息" name="formData">
<!--							        <div>-->
<!--							         {{changeContent}}-->
<!--							        </div>-->
							<preChangeContent v-if="changeContent" v-model="changeContent"></preChangeContent>
							<el-descriptions v-if="getItems(changeContent,'申请内容')" class="descriptions" title="申请内容"  border  :column="2" style="margin-top: 15px;">
								<el-descriptions-item v-for="item in getItems(changeContent,'申请内容')"  :label="item.name">
									<div v-if="item.name === '上传图片' && item.value">
										<el-image
                                           style="width: 100px; height: 100px;margin-right: 10px;border-radius: 5px;"
										   v-for="img in item.value.split(',')"
                                           :src="img"
                                           :zoom-rate="1.2"
                                           :max-scale="7"
                                           :min-scale="0.2"
                                           :preview-src-list="item.value.split(',')"
                                           show-progress
                                           :initial-index="4"
                                           fit="cover"
                                        />
									</div>
									<span v-else>{{item.value || '-'}}</span>
								</el-descriptions-item>
							</el-descriptions>
							<el-descriptions v-if="getItems(changeContent,'提交内容')" class="descriptions" title="提交内容"  border  :column="2" style="margin-top: 15px;">
								<el-descriptions-item v-for="item in getItems(changeContent,'提交内容')"  :label="item.name">
									<div v-if="item.name === '上传图片' && item.value">
										<el-image
                                           style="width: 100px; height: 100px;margin-right: 10px;border-radius: 5px;"
										   v-for="img in item.value.split(',')"
                                           :src="img"
                                           :zoom-rate="1.2"
                                           :max-scale="7"
                                           :min-scale="0.2"
                                           :preview-src-list="item.value.split(',')"
                                           show-progress
                                           :initial-index="4"
                                           fit="cover"
                                        />
									</div>
									<span v-else>{{item.value || '-'}}</span>
								</el-descriptions-item>
							</el-descriptions>
						</el-tab-pane>
						<el-tab-pane label="流转记录" name="flowRecord">
							<!--        {{recordList}}-->
							<flowRecord v-model="recordList" :status="objData.status"></flowRecord>
						</el-tab-pane>
						<el-tab-pane label="流程图" name="flowImg">
							<!--        <div>{{processData}}</div>-->
							<process-render ref="processRender" :style="`transform: scale(${zoom / 100})`" v-model="processData" :readonly="true" />
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
			<template #footer v-if="setHandleBtn()">
				<el-divider></el-divider>
				<div class="flow-dialog-footer">
					<div>
						<el-button type="success" :icon="Check" @click="onHandler('pass')">同意</el-button>
					</div>
					<div>
						<el-button type="danger" :icon="Close" @click="onHandler('reject')">拒绝</el-button>
					</div>
				</div>
			</template>
		</el-drawer>

		<div>
			<el-dialog v-model="handleVisiable" title="同意" width="30%">
				<template #header>
					<div style="height: 30px; font-size: 1.2em">
						{{ handleMode === 'pass' ? '同意' : '拒绝' }}
						<el-divider></el-divider>
					</div>
				</template>
				<el-form label-position="top">
					<el-form-item label="审批意见">
						<el-input v-model="handleOpinions" :rows="3" type="textarea" placeholder="请输入处理意见" />
					</el-form-item>
				</el-form>

				<template #footer>
					<div>
						<el-button @click="handleVisiable = false">取消</el-button>
						<el-button type="primary" @click="handleSubmit">确定</el-button>
					</div>
				</template>
			</el-dialog>
		</div>
	</div>
</template>

<style scoped lang="less">
.flow-dialog {
	padding: 20px;
	color: #5c5c5c;
	.flow-dialog-title {
		font-size: 1.2em;
		font-weight: bold;
		margin-right: 10px;
	}
	.flow-dialog-no {
		font-size: 1.1em;
		margin: 20px 0;
	}
	.flow-dialog-tabs {
		margin-top: 10px;
	}
}
.flow-dialog-footer {
	height: 50px;
	display: flex;
	justify-content: flex-start;
	justify-items: center;
	gap: 10px;
	padding: 0 20px;
}

::v-deep.descriptions {
	.el-descriptions__cell,.el-descriptions__label {
		vertical-align: top;
	}
}
</style>
