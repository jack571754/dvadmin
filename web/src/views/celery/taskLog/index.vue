<template>
    <fs-page>
        <fs-crud ref="crudRef" v-bind="crudBinding">
            <template #cell_task_kwargs="scope">
                <el-popover placement="bottom" :width="600" trigger="click" @hide="taskKwargsShow=false">
                    <template #reference>
                        <el-button class="m-2" type="primary" @click="taskKwargsValue = scope.row.task_kwargs;taskKwargsShow=true">{{ t('message.pages.taskLog.buttons.view') }}</el-button>
                    </template>
                    <div style="height: 260px;">
                        <JsonEditorVue class="editor" v-if="taskKwargsShow" style="height: 250px;" v-model="taskKwargsValue"/>
                    </div>
                </el-popover>
            </template>
            <template #cell_result="scope">
                <el-popover placement="bottom" :width="600" trigger="click" @hide="resultShow=false">
                    <template #reference>
                        <el-button class="m-2" type="success" @click="resultValue = scope.row.result;resultShow=true">{{ t('message.pages.taskLog.buttons.view') }}</el-button>
                    </template>
                    <div style="height: 260px;">
                        <JsonEditorVue class="editor" v-if="resultShow" style="height: 250px;" v-model="resultValue"/>
                    </div>
                </el-popover>
            </template>
        </fs-crud>
    </fs-page>
</template>

<script lang="ts" setup name="taskLog">
import { ref, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import JsonEditorVue from 'json-editor-vue3';
import 'jsoneditor';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const taskKwargsValue = ref({});
const taskKwargsShow = ref(false);
const resultValue = ref({});
const resultShow = ref(false);
const props = defineProps<{ taskItem: object }>();

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions, context: { taskItem: props.taskItem } });

onMounted(() => {
    crudExpose.doRefresh();
});
</script>
