<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<template #cell_icon="scope">
				<div style="text-align: center; margin-left: 25px">
					<iconify :icon="scope.row.icon.name" :style="{ background: scope.row.icon.bgc, color: scope.row.icon.color }" height="20" />
				</div>
			</template>
			<template #cell_model_type="scope">
				<div style="text-align: center">
					<el-tag :type="scope.row.model_type==0?'primary':'success'">{{scope.row.model_type==0?'数据库表':'动态表单'}}</el-tag>
					<el-tag type="warning" v-if="scope.row.model_type==0 && scope.row.model_name">{{scope.row.model_name}}</el-tag>
					<el-tag type="danger" v-if="scope.row.model_type==0 && scope.row.operation">{{operationOptions[scope.row.operation]}}</el-tag>
				</div>
			</template>
			<template #actionbar-left>
				<el-button type="primary" @click="onCreate" v-auth="'flowInfo:Create'">新建流程</el-button>
			</template>
			<template #cell-rowHandle-left="scope">
				<el-button type="primary" text size="small" @click="onView(scope)" v-auth="'flowInfo:Retrieve'">查看</el-button>
				<el-button type="primary" text size="small" @click="onEdit(scope)" v-auth="'flowInfo:Update'">设计流程</el-button>
			</template>
		</fs-crud>
		<flowProcess v-if="processShow" v-model="processShow" :mainId="mainId" @close="closeClick"></flowProcess>
		<flowDesigner v-if="designerShow" v-model="designerShow" :mainId="mainId" @close="closeClick"></flowDesigner>
	</fs-page>
</template>

<script lang="ts" setup name="flowInfo">
import { ref, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { GetPermission } from './api';
import { handleColumnPermission } from '/@/utils/columnPermission';
import { request } from '/@/utils/service';
import { Icon as iconify } from '@iconify/vue';
import flowProcess from '../flowManagement/components/flowProcess.vue';
import FlowDesigner from '../flowManagement/components/flowDesigner.vue';
import nodeType from '../wflow/design/process/ProcessNodes';

const { crudBinding, crudRef, crudExpose, crudOptions, resetCrudOptions } = useFs({ createCrudOptions });

const processShow = ref(false);
const designerShow = ref(false);
const mainId = ref();

const operationOptions = {
	create:'新增',
	update:'修改',
	delete:'删除',
}

const onCreate = () => {
	request({
		url: '/api/dvadmin3_flow/flow_info/',
		method: 'post',
		data: {
			name: '未命名流程',
			icon: {
				name: 'file-icons:omnigraffle',
				bgc: '#4C87F3',
				color: '#FFFFFF',
			},
			groupId: null,
			content_type: null,
			operation: null,
			formConf: {
				conf: {
					labelPosition: 'right',
					labelWidth: 100,
					size: 'default',
				},
				components: [],
			},
			process: [nodeType.Start.create(), nodeType.End.create()],
			remark: null,
			dept_info: null,
			user_info: null,
			role_info: null,
		},
	}).then((res) => {
		const { data } = res;
		mainId.value = data.flow_id;
		designerShow.value = true;
	});
};

const onEdit = ({ row }) => {
	const { id } = row;
	mainId.value = id;
	designerShow.value = true;
};

const onView = ({ row }) => {
	const { id } = row;
	mainId.value = id;
	processShow.value = true;
};

const closeClick = () => {
	crudExpose.doRefresh();
}

// 页面打开后获取列表数据
onMounted(async () => {
	// 设置列权限
	const newOptions = await handleColumnPermission(GetPermission, crudOptions);
	//重置crudBinding
	resetCrudOptions(newOptions);
	// 刷新
	crudExpose.doRefresh();
});
</script>
