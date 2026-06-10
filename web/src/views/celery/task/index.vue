<template>
    <fs-page>
        <fs-crud ref="crudRef" v-bind="crudBinding">
            <template #form_cron="scope">
                <el-form-item style="margin-bottom: 20px" :rules="{ required: true, message: t('message.pages.taskManage.form.validation.cronRequired'), trigger: 'blur' }">
                    <div>
                        <div><el-button type="primary" @click="handleShowCron(scope.form)" size="small">{{ t('message.pages.taskManage.form.cron') }}</el-button></div>
                        <span v-if="scope.form.cron">
                            <div>{{ scope.form.cron }}</div>
                            <div>{{ scope.form.cron ? humanizeCronInChinese(scope.form.cron) : '' }}</div>
                        </span>
                    </div>
                </el-form-item>
            </template>
            <template #form_kwargs="scope">
                <div style="height: 260px;">
                    <JsonEditorVue class="editor" style="height: 250px;" v-model="scope.form.kwargs"/>
                </div>
            </template>
            <el-row v-if="crudBinding?.data" :gutter="15" style="height: 100%; width: 100%; overflow: auto">
                <span v-if="crudBinding?.data.length === 0" style="width: 100%;"><el-empty :description="t('message.pages.taskManage.empty')" /></span>
                <el-col
                    v-for="(item, index) of crudBinding?.data"
                    :key="item.id"
                    :xl="4"
                    :lg="6"
                    :md="8"
                    :sm="12"
                    :xs="24"
                    :span="6"
                    style="margin-bottom: 10px"
                >
                    <el-card class="task task-item" shadow="hover">
                        <h2>{{ item.name }}</h2>
                        <ul>
                            <li>
                                <h4>{{ t('message.pages.taskManage.card.executeTask') }}</h4>
                                <p>{{ item.task }}</p>
                            </li>
                            <li>
                                <h4>{{ t('message.pages.taskManage.card.cronRule') }}</h4>
                                <p>{{ item.cron ? humanizeCronInChinese(item.cron) : '--' }}</p>
                            </li>
                            <li>
                                <h4>{{ t('message.pages.taskManage.card.lastRunTime') }}</h4>
                                <p>{{ item.last_run_at || '--' }}</p>
                            </li>
                        </ul>
                        <div class="bottom w-full">
                            <div class="state flex flex-wrap items-center">
                                <el-popconfirm
                                    width="180"
                                    :confirm-button-text="t('message.pages.taskManage.buttons.confirm')"
                                    :cancel-button-text="t('message.pages.taskManage.buttons.cancel')"
                                    :title="item.enabled ? t('message.pages.taskManage.dialog.confirmStop') : t('message.pages.taskManage.dialog.confirmEnable')"
                                    @confirm="setTaskStatus(item)"
                                >
                                    <template #reference>
                                        <el-tag v-if="item.enabled == true" type="success" effect="dark">{{ t('message.pages.taskManage.buttons.enable') }}</el-tag>
                                        <el-tag v-else type="danger" effect="dark">{{ t('message.pages.taskManage.buttons.disabled') }}</el-tag>
                                    </template>
                                </el-popconfirm>
                                <div class="ml-2">
                                    <el-popconfirm
                                        width="180"
                                        :confirm-button-text="t('message.pages.taskManage.buttons.confirm')"
                                        :cancel-button-text="t('message.pages.taskManage.buttons.cancel')"
                                        :title="t('message.pages.taskManage.dialog.confirmRun')"
                                        @confirm="runTask(item)"
                                    >
                                        <template #reference>
                                            <el-button type="primary" size="small" circle plain>
                                                <el-icon><CaretRight /></el-icon>
                                            </el-button>
                                        </template>
                                    </el-popconfirm>
                                </div>
                            </div>
                            <div class="taskName">
                                <el-dropdown trigger="hover" class="ml-2">
                                    <el-button type="primary" size="small" circle effect>
                                        <el-icon><Edit /></el-icon>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item :icon="Edit" @click="openEdit(item)">{{ t('message.pages.taskManage.buttons.edit') }}</el-dropdown-item>
                                            <el-dropdown-item :icon="Delete" @click="doRemove(item)" divided>{{ t('message.pages.taskManage.buttons.delete') }}</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                                <el-button type="primary" size="small" circle plain @click="taskLogs(item)" class="ml-2">
                                    <el-icon><Monitor /></el-icon>
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </fs-crud>
        <el-dialog v-model="openCron" :title="t('message.pages.taskManage.dialog.cronSelector')" width="800">
            <Crontab v-if="openCron" @fill="crontabFill" :expression="newVal.cron" />
        </el-dialog>
        <el-dialog v-model="showTaskDialogVisible" :title="t('message.pages.taskManage.dialog.taskLogs')" width="1200" class="rounded-lg">
            <div style="height: 600px; position: relative">
                <task-log-inner :taskItem="selectedTask" v-if="showTaskDialogVisible"></task-log-inner>
            </div>
        </el-dialog>
    </fs-page>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { Delete, Edit, Monitor } from '@element-plus/icons-vue';
import { humanizeCronInChinese } from 'cron-chinese';
import Crontab from '@great-dream/dvadmin3-celery-web/src/taskManage/component/crontab/index.vue';
import JsonEditorVue from 'json-editor-vue3';
import 'jsoneditor';
import { toRaw } from 'vue';
import { successMessage } from '/@/utils/message';
import { RunTask, UpdateTask } from './api';
import { useI18n } from 'vue-i18n';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const taskLogInner = defineAsyncComponent(() => import('../taskLog/index.vue'));

const { crudBinding, crudRef, crudExpose, resetCrudOptions } = useFs({ createCrudOptions });

const openCron = ref(false);
const newVal = ref({ cron: '' });
const showTaskDialogVisible = ref(false);
let selectedTask = ref({});

// 语言切换时重新构建 crud options
const { themeConfig } = storeToRefs(useThemeConfig());
watch(
    () => themeConfig.value.globalI18n,
    () => {
        resetCrudOptions();
    }
);

const taskLogs = (item: any) => {
    selectedTask.value = toRaw(item);
    showTaskDialogVisible.value = true;
};

const setTaskStatus = (item: any) => {
    item.enabled = !item.enabled;
    UpdateTask({ enabled: item.enabled, id: item.id }).then((res: any) => {
        if (res.code === 2000) {
            successMessage(res.msg as string);
        }
    });
};

function crontabFill(value: any) {
    openCron.value = false;
    newVal.value.cron = value;
}

onMounted(async () => {
    crudExpose.doRefresh();
});

function openEdit(opts: any) {
    crudExpose.openEdit({ row: toRaw(opts) });
}

function doRemove(opts: any) {
    crudExpose.doRemove({ row: toRaw(opts) });
}

function handleShowCron(val: any) {
    newVal.value = val;
    openCron.value = true;
}

const runTask = (item: any) => {
    RunTask(item).then((res: any) => {
        if (res.code === 2000) {
            successMessage(res.msg as string);
        }
    });
};
</script>

<style lang="scss" scoped>
task { height: 260px; }

.task-item h2 {
    font-size: 15px;
    color: #3c4a54;
    padding-bottom: 10px;
}

.task-item li {
    list-style-type: none;
    margin-bottom: 10px;
}

.task-item li h4 {
    font-size: 12px;
    font-weight: normal;
    color: #999;
}

.task-item li p { margin-top: 5px; }

.task-item .bottom {
    border-top: 1px solid #ebeef5;
    text-align: right;
    padding-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.task-add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    color: #999;
}

.task-add:hover { color: #409eff; }
.task-add i { font-size: 30px; }
.task-add p { font-size: 12px; margin-top: 20px; }

.dark .task-item .bottom { border-color: var(--el-border-color-light); }

.el-card { border-radius: 3%; overflow: hidden; }
.el-dialog { border-radius: 3%; overflow: hidden; }
</style>
