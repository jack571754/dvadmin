<template>
  <fs-page>
    <el-row class="mx-2">
      <el-col xs="24" :sm="8" :md="6" :lg="4" :xl="4" class="p-1">
        <el-card :body-style="{ height: '100%' }">
          <p class="font-mono font-black text-center text-xl pb-5">
            {{ $t('message.pages.user.tree.deptList') }}
            <el-tooltip effect="dark" :content="content" placement="right">
              <el-icon>
                <QuestionFilled/>
              </el-icon>
            </el-tooltip>
          </p>
          <el-input v-model="filterText" :placeholder="$t('message.pages.user.tree.deptPlaceholder')"/>
          <el-tree ref="treeRef" class="font-mono font-bold leading-6 text-7xl" :data="data" :props="treeProps"
                   :filter-node-method="filterNode" icon="ArrowRightBold" :indent="38" highlight-current @node-click="onTreeNodeClick">
            <template #default="{ node, data }">
              <element-tree-line :node="node" :showLabelLine="false" :indent="32">
					<span v-if="data.status" class="text-center font-black font-normal">
						<SvgIcon name="iconfont icon-shouye" color="var(--el-color-primary)"/>&nbsp;{{ node.label }}
					</span>
                <span v-else color="var(--el-color-primary)"> <SvgIcon name="iconfont icon-shouye"/>&nbsp;{{
                    node.label
                  }} </span>
              </element-tree-line>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col xs="24" :sm="16" :md="18" :lg="20" :xl="20" class="p-1">
        <el-card :body-style="{ height: '100%' }">
          <fs-crud ref="crudRef" v-bind="crudBinding">
            <template #actionbar-right>
              <importExcel api="api/system/user/" v-auth="'user:Import'">{{ $t('message.pages.user.buttons.import') }}</importExcel>
            </template>
            <template #cell_avatar="scope">
              <div v-if="scope.row.avatar" style="display: flex; justify-content: center; align-items: center;">
                <el-image 
                  style="width: 50px; height: 50px; border-radius: 50%; aspect-ratio: 1 / 1;" 
                  :src="getBaseURL(scope.row.avatar)"
                  :preview-src-list="[getBaseURL(scope.row.avatar)]" 
                  :preview-teleported="true" />
              </div>
            </template>
          </fs-crud>
        </el-card>
      </el-col>
    </el-row>

    <PlatformPermissionDialog ref="platformDialog" />
  </fs-page>
</template>

<script lang="ts" setup name="user">
import {useExpose, useCrud} from '@fast-crud/fast-crud';
import {createCrudOptions} from './crud';
import * as api from './api';
import {ElTree} from 'element-plus';
import {ref, onMounted, watch, toRaw, h} from 'vue';
import XEUtils from 'xe-utils';
import {getElementLabelLine} from 'element-tree-line';
import importExcel from '/@/components/importExcel/index.vue'
import {getBaseURL} from '/@/utils/baseUrl';
import { i18n } from '/@/i18n/index';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import PlatformPermissionDialog from './components/PlatformPermissionDialog.vue';
import type { UserPageContext } from './context';
import { useRowMutation } from '/@/shared/composables/rowMutation';
import { createUserFormSession } from '/@/features/users/formSession';
import { prepareUserPayload } from '/@/features/users/payload';
import { deriveUserFormKeys } from '/@/features/users/formKeys';
import { normalizeFieldPolicy, applyFieldPolicy, type FieldPolicy } from '/@/shared/api/fieldPolicy';
import { focusFirstError } from '/@/shared/ui/formFocus';
import { auth } from '/@/utils/authFunction';
import { captureSession } from '/@/shared/access/sessionEvents';
const { t } = useI18n();
const platformDialog = ref<InstanceType<typeof PlatformPermissionDialog>>();
const fieldPolicy = ref<FieldPolicy>({});
const formSession = createUserFormSession(() => '保存用户失败');


const { themeConfig } = storeToRefs(useThemeConfig());

const ElementTreeLine = getElementLabelLine(h);

interface APIResponseData {
  code?: number;
  data: [];
  msg?: string;
}

// 引入组件
const filterText = ref('');
const treeRef = ref<InstanceType<typeof ElTree>>();

const treeProps = {
  children: 'children',
  label: 'name',
  icon: 'icon',
};

watch(filterText, (val) => {
  treeRef.value!.filter(val);
});

const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return toRaw(data).name.indexOf(value) !== -1;
};

let data = ref([]);

const content = i18n.global.t('message.pages.user.tree.deptInfo');

const getData = () => {
  api.GetDept({}).then((ret: APIResponseData) => {
    const responseData = ret.data;
    const result = XEUtils.toArrayTree(responseData, {
      parentKey: 'parent',
      children: 'children',
    });

    data.value = result;
  });
};

//树形点击事件
const onTreeNodeClick = (node: any) => {
  const {id} = node;
  crudExpose.doSearch({form: {dept: id}});
};

// crud组件的ref
const crudRef = ref();
// crud 配置的ref
const crudBinding = ref();
// 暴露的方法
const {crudExpose} = useExpose({crudRef, crudBinding});
// 你的crud配置
const userContext: UserPageContext = {
  i18n: { t }, statusMutation: useRowMutation(), formSession,
  listRequest: query => api.GetList(query),
  openPlatformPermissions: row => { void platformDialog.value?.open(row); },
  onExportTask: () => {}, startForm: () => formSession.clear(),
  // 提交失败后把用户带到第一个出错字段；首字段名由 formSession 算好
  focusFormError: (field?: string) => {
    void focusFirstError(crudExpose.getFormRef()?.formRef, field);
  },
  assertFormAccess: mode => {
    if (!auth(mode === 'add' ? 'user:Create' : 'user:Update')) throw new Error('用户权限已变更');
  },
  canUpdateField: key => fieldPolicy.value[key]?.is_update !== false,
  statusPayload: row => ({ id: row.id, is_active: row.is_active }),
  openUserForm: async (mode, row, index) => {
    userContext.assertFormAccess(mode);
    if (mode === 'add') await crudExpose.openAdd({});
    else await crudExpose.openEdit({ row, index });
  },
  submitUser: async (mode, form, id) => {
    userContext.assertFormAccess(mode);
    const assertCurrent = captureSession();
    const permission = await api.GetPermission();
    assertCurrent(); userContext.assertFormAccess(mode);
    fieldPolicy.value = normalizeFieldPolicy(permission.data);
    const payload = prepareUserPayload(form, mode, fieldPolicy.value, deriveUserFormKeys(crudOptions.columns as Record<string, any>), id);
    return mode === 'add' ? api.AddObj(payload as any) : api.UpdateObj(payload as any);
  },
};
const {crudOptions} = createCrudOptions({crudExpose, context: userContext});
// 初始化crud配置
const {resetCrudOptions} = useCrud({crudExpose, crudOptions});

// 语言切换时重新构建 crud options
watch(
	() => themeConfig.value.globalI18n,
	() => {
		resetCrudOptions(crudOptions);
	}
);

// 页面打开后获取列表数据
onMounted(async () => {
  getData();
  const permission = await api.GetPermission();
  fieldPolicy.value = normalizeFieldPolicy(permission.data);
  resetCrudOptions({ ...crudOptions, columns: applyFieldPolicy(crudOptions.columns as Record<string, any>, fieldPolicy.value) as any });
  await crudExpose.doRefresh();
});
</script>

<style lang="scss" scoped>
.el-row {
  height: 100%;

  .el-col {
    height: 100%;
  }
}

.el-card {
  height: 100%;
  border-radius: var(--admin-radius-lg, 10px);
  border: 1px solid var(--admin-border);
  box-shadow: var(--admin-shadow-xs);
  background: var(--admin-surface);
}

.font-normal {
  font-family: inherit;
}

:deep(.fs-toolbar .el-button) {
  background: var(--admin-surface);
  color: var(--admin-muted);
  border-color: var(--admin-border);
}

:deep(.el-table__cell) {
  border-right: 0 !important;
}

:deep(.el-table .cell) {
  padding-left: 14px;
  padding-right: 14px;
}

:deep(.fs-crud .el-pagination) {
  font-size: 12px;
}

:deep(.el-table__body-wrapper) {
  min-height: 270px;
}
</style>
