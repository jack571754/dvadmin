<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<template #cell_icon="scope" style="text-align: center">
				<div style="text-align: center; margin-left: 25px">
					<iconify :icon="scope.row.icon.name" :style="{ background: scope.row.icon.bgc, color: scope.row.icon.color }" height="20" />
				</div>
			</template>
			<template #cell_model_type="scope" style="text-align: center">
				<div style="text-align: center; margin-left: 25px">
					<el-tag :type="scope.row.model_type==0?'primary':'success'">{{scope.row.model_type==0?'数据库表':'动态表单'}}</el-tag>
					<el-tag type="warning" v-if="scope.row.model_type==0">{{scope.row.model_name}}</el-tag>
					<el-tag type="danger" v-if="scope.row.model_type==0">{{operationOptions[scope.row.operation]}}</el-tag>
				</div>
			</template>
			<template #cell_status="scope" style="text-align: center">
				<el-select v-model="scope.row.status" @change="(val)=>changeStatus(val, scope.row.id)">
					<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled">
					</el-option>
				</el-select>
			</template>
			<template #actionbar-left>
				<el-button type="primary" @click="onCreate">新建流程</el-button>
			</template>
			<template #cell-rowHandle-left="scope">
				<el-button type="primary" text size="small" @click="onView(scope)"
					>查看
					<el-icon>
						<View />
					</el-icon>
				</el-button>
				<el-button type="primary" text size="small" @click="onEdit(scope)"
					>编辑
					<el-icon>
						<EditPen />
					</el-icon>
				</el-button>
			</template>
		</fs-crud>
		<flowProcess v-if="processShow" v-model="processShow" :mainId="mainId" @close="closeClick"></flowProcess>
		<flowDesigner v-if="designerShow" v-model="designerShow" :mainId="mainId" @close="closeClick"></flowDesigner>
	</fs-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { request } from '/@/utils/service';
import { useRouter } from 'vue-router';
import nodeType from '../wflow/design/process/ProcessNodes';
import { Icon as iconify } from '@iconify/vue';
import flowProcess from './components/flowProcess.vue';
import FlowDesigner from './components/flowDesigner.vue';
import {putStatus} from "./api";
import {ElMessage} from "element-plus";

const router = useRouter();
const processShow = ref(false);
const designerShow = ref(false);
const mainId = ref();

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions });

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

const operationOptions = {
	create:'新增',
	update:'修改',
	delete:'删除',
}

const statusOptions = [
	{ label: '待发布', value: 0, disabled: true },
	{ label: '启用', value: 1 },
	{ label: '停用', value: 2 },
]

const changeStatus = (val, id) => {
	const obj = {
		id: id,
		status: val
	}
	putStatus(obj).then(res => {
		const { msg } = res
		ElMessage.success(msg)
		crudExpose.doRefresh();
	})
}

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

onMounted(() => {
	crudExpose.doRefresh();
});
</script>
