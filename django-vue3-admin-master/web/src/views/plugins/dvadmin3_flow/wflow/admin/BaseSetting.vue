<script setup lang="ts">
import { Icon as iconify } from '@iconify/vue';
import {computed, onMounted, ref, nextTick, provide,watch} from 'vue';
import request from '../../api/request';
import { CreateCrudOptionsProps, CreateCrudOptionsRet, dict } from '@fast-crud/fast-crud';
import { detpDict, deptCurdOptions,roleDict, roleCurdOptions,userDict, userCurdOptions, } from './config/orgConfig.ts';
import {getRoleToDeptAll} from "/@/views/system/role/components/api";
import XEUtils from "xe-utils";
import {TableInstance} from "element-plus";
import conditionConfig from "../../components/conditionConfig/index.vue"
import { ElNotification } from 'element-plus'
const props = defineProps({
	modelValue: Object,
});
const form = ref();

const modelTypeActiveName = ref(['1'])
const excludeFieldsActiveName = ref(['1'])

defineExpose({ validate });
const emit = defineEmits(['update:modelValue']);
const _value: any = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit('update:modelValue', val);
	},
});

const groupList = ref([{ id: 222, name: '测试' }]);
const value_list = computed(()=>{
  return _value.value.exclude_fields
})

const validateValueList = () => {
	if(value_list.value.length === 0) return true
    let status = true
    value_list.value.forEach((item:any) => {
        item.context.forEach((ite:any) => {
            if (!ite.field) {
                status = false
            }
        })
    })
	return status
}

function validate() {
	return new Promise((resolve, reject) => {
    if (!validateValueList()) return reject(["请填写完整的字段排除规则"])
		form.value
			.validate()
			.then(() => resolve())
			.catch((err:any) => {
				reject(Object.keys(err).map((v) => err[v][0].message));
			});
	});
}

const rules = {
	name: [
		{ required: true, message: '请设置流程表单名称', trigger: 'blur' },
		{ min: 2, max: 20, message: '流程表单名称长度在2~20', trigger: 'blur' },
	],
	groupId: [{ required: true, message: '请设置流程表单分组', trigger: 'blur' }],
	model_type: [{ required: true, message: '请选择流程类型', trigger: 'blur' }],
	content_type: [{ required: true, message: '请选择库表', trigger: 'blur' }],
	operation: [{ required: true, message: '请选择库表操作', trigger: 'blur' }],
  exclude_fields: [{ required: false, message: '请填写字段排除规则', trigger: 'blur' }],
};

const iconList = [
	'bi:people-fill',
	'gridicons:multiple-users',
	'icon-park-solid:appointment',
	'icon-park-solid:people',
	'fluent:people-add-24-filled',
	'material-symbols:person-cancel-rounded',
	'ph:coffee-fill',
	'ph:sneaker-move-fill',
	'solar:money-bag-bold',
	'healthicons:money-bag',
	'solar:wallet-money-bold',
	'f7:money-yen-circle-fill',
	'entypo:aircraft',
	'entypo:aircraft-take-off',
	'mingcute:bus-2-fill',
	'mingcute:car-fill',
	'mingcute:train-fill',
	'fluent:handshake-20-filled',
	'icon-park-solid:buy',
	'mingcute:hand-card-fill',
	'icon-park-solid:time',
	'mdi:gift',
	'bxs:map',
	'ph:fingerprint-fill',
	'mdi:customer-service',
	'icon-park-solid:general-branch',
	'bx:bxs-purchase-tag',
	'mdi:notebook-edit',
	'simple-icons:opsgenie',
	'streamline:business-user-curriculum-solid',
	'fa6-solid:business-time',
	'mdi:google-my-business',
	'mdi:qqchat',
	'mdi:wechat',
	'bxs:message-square-detail',
	'mingcute:send-plane-fill',
	'tabler:mail-filled',
	'material-symbols:folder-open',
	'icon-park-solid:computer',
	'material-symbols:laptop-mac-outline',
	'fluent:phone-vibrate-20-filled',
	'fluent:form-28-filled',
	'file-icons:omnigraffle',
	'material-symbols:assignment-turned-in',
	'mingcute:card-refund-fill',
	'mingcute:wechat-miniprogram-fill',
	'whh:phonebookalt',
	'ri:database-2-fill',
	'ph:bank-fill',
	'material-symbols:school',
	'iconamoon:smiling-face-fill',
	'solar:sad-circle-bold',
	'ri:hearts-fill',
	'mdi:qrcode-scan',
	'fluent:calendar-cancel-16-filled',
	'ion:videocam',
	'material-symbols:play-circle',
	'jam:unsplash',
	'ph:film-reel-fill',
	'icon-park-solid:noodles',
	'dashicons:food',
	'fluent:food-cake-16-filled',
	'mdi:food',
	'material-symbols:delete',
	'material-symbols:edit-document',
	'material-symbols:chart-data',
	'ph:chart-pie-slice-fill',
];

//获取所有的库表
const contentTypeList = ref<any>([]);
const getContentType = () => {
	return request({
		url: '/api/dvadmin3_flow/flow_info/get_all_flow_content_type/',
		method: 'get',
	}).then((rsp) => {
		contentTypeList.value = rsp.data;
	});
};
const handleList = ref([
	{
		value: 'create',
		label: '新增',
	},
	{
		value: 'update',
		label: '编辑',
	},
	{
		value: 'delete',
		label: '删除',
	},
]);



//选中的库字段
const handleContentType = (value:any) => {
	const obj = contentTypeList.value.find((v) => v.value === value);
	if (obj) {
		_value.value.formConf['components'] = obj.field_list;
	} else {
		_value.value.formConf['components'] = [];
	}
};
const deptData = ref([]);
const exempt_fields = computed(()=>{
  return _value.value.formConf['components']
})
provide('exempt_fields',exempt_fields)



onMounted(async () => {
	getContentType();
  const res = await getRoleToDeptAll({});
	deptData.value = XEUtils.toArrayTree(res.data, { parentKey: 'parent', strict: false });




});
</script>

<template>
	<el-main class="w-designer-base">
		<el-form ref="form" :rules="rules" :model="_value" label-position="top">
			<el-form-item prop="icon" label="设置图标">
				<iconify :icon="_value.icon.name" class="w-process-icon" style="font-size: 24px" :style="{ background: _value.icon.bgc, color: _value.icon.color }" />
				<div style="margin: 0 40px">
					<el-text>选择背景色：</el-text>
					<el-color-picker v-model="_value.icon.bgc" />
				</div>
				<div style="display: flex; align-items: center">
					<el-text>选择图标：</el-text>
					<el-popover placement="bottom-start" width="402" trigger="click">
						<div class="w-icons">
							<iconify class="w-icons-ico" @click.native="_value.icon.name = ico" :icon="ico" v-for="ico in iconList" :key="ico"></iconify>
							<div style="width: 31px; height: 0" v-for="i in 12"></div>
						</div>
						<template #reference>
							<iconify class="w-p-icon" style="padding: 0;font-size: 24px" slot="reference" :icon="_value.icon.name"></iconify>
						</template>
					</el-popover>
				</div>
			</el-form-item>
			<el-form-item prop="name" required label="流程名称">
				<el-input v-model="_value.name" placeholder="请设置流程名" />
			</el-form-item>
			<!--      <el-form-item prop="groupId" required label="流程分组">-->
			<!--        <el-select style="width: calc(100% - 140px); padding-right: 20px;" v-model="_value.groupId" placeholder="请选择流程分组">-->
			<!--          <el-option :value="group.id" :label="group.name" v-for="group in groupList"></el-option>-->
			<!--        </el-select>-->
			<!--        <el-button style="width: 120px; float: right" type="primary" icon="plus">新建分组</el-button>-->
			<!--      </el-form-item>-->
			<el-form-item prop="model_type" required label="流程类型">
				<el-radio-group v-model="_value.model_type">
					<el-radio-button label="数据库表" :value="0" />
					<el-radio-button label="动态表单" :value="1" />
				</el-radio-group>
			</el-form-item>
			<el-row>
				<el-col :span="12">
					<el-form-item prop="content_type" required label="关联库表" v-if="_value.model_type === 0">
						<el-select
							style="width: calc(100% - 140px); padding-right: 20px"
							v-model="_value.content_type"
							clearable
							placeholder="请选择"
							@change="handleContentType"
						>
							<el-option :value="item.value" :label="item.label" v-for="item in contentTypeList"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item prop="operation" required label="库表操作" v-if="_value.model_type === 0">
						<el-select style="width: calc(100% - 140px); padding-right: 20px" v-model="_value.operation" placeholder="请选择">
							<el-option :value="group.value" :label="group.label" v-for="group in handleList"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
      <el-form-item v-if="_value.model_type === 0" prop="rule_status" label="流程规则">
        <el-select v-model="_value.rule_status" placeholder="请选择">
          <el-option label="无" :value="1"></el-option>
          <el-option label="进入流程" :value="2"></el-option>
          <el-option label="跳过流程" :value="3"></el-option>
        </el-select>
        <conditionConfig v-if="_value.rule_status==2" v-model="_value.enter_fields" title="满足条件后，进入审批流程！"></conditionConfig>
        <conditionConfig  v-if="_value.rule_status==3" v-model="_value.exclude_fields" title="满足条件后，跳过审批流程！"></conditionConfig>

      </el-form-item>
			<el-form-item v-if="_value.model_type === 0">
        <el-collapse v-model="modelTypeActiveName" style="width: 100%">
          <el-collapse-item title="流程列表中查看数据时显示" name="1">
            <el-table :data="_value.formConf.components" border height="200">
              <el-table-column prop="name" label="字段名称"></el-table-column>
              <el-table-column prop="columnShow" label="后台显示">
                <template v-slot="scope">
                  <el-switch
                      v-model="scope.row.columnShow"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      active-text="显示"
                      inactive-text="隐藏"
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column prop="columnShow" label="移动端显示">
                <template v-slot="scope">
                  <el-switch
                      v-model="scope.row.mobileShow"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      active-text="显示"
                      inactive-text="隐藏"
                  ></el-switch>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
			</el-form-item>
			<el-form-item label="可查看流程的部门(与角色为【并且】关系)">
        <el-tree-select
            v-model="_value.dept_info"
            :data="deptData"
            multiple
            node-key="id"
            :props="{
              label: 'name',
              disabled: 'id1',
              children: 'children'
            }"
            filterable
            show-checkbox
            check-strictly
            style="width: 100%"
          />
			</el-form-item>

			<el-form-item label="可查看流程的角色(与部门为【并且】关系)">
				<fs-table-select
					v-model="_value.role_info"
					:multiple="true"
					:createCrudOptions="roleCurdOptions"
					:dict="roleDict"
					:dialog="{ width: '500px' }"
				></fs-table-select>
      </el-form-item>
			<el-form-item label="可查看流程的用户(与角色和部门为【或者】关系)">
        <fs-table-select
            v-model="_value.user_info"
            :multiple="true"
            :createCrudOptions="userCurdOptions"
            :dict="userDict"
            :dialog="{ width: '600px' }"
        ></fs-table-select>
      </el-form-item>
			<el-form-item label="备注说明">
				<el-input v-model="_value.remark" show-word-limit maxlength="128" :rows="3" type="textarea" placeholder="流程备注说明信息"></el-input>
			</el-form-item>
		</el-form>
	</el-main>
</template>

<style lang="less" scoped>
.w-designer-base {
	margin: 0 auto;
	border-radius: 5px;
	background-color: white;
	width: 800px;
	min-height: calc(100vh - 100px);
}

.w-p-icon {
	font-size: 20px;
	cursor: pointer;
	color: var(--el-color-info);
}

.w-icons {
	overflow: auto;
	max-height: 400px;
	padding: 2px;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;

	.w-icons-ico {
		width: 25px;
		height: 25px;
		padding: 3px;
		cursor: pointer;
		border-radius: 2px;

		&:hover {
			box-shadow: 0 0 3px 0 #9b9595;
		}
	}
}
</style>
