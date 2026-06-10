import { CreateCrudOptionsProps, CreateCrudOptionsRet, AddReq, DelReq, EditReq, dict, compute } from '@fast-crud/fast-crud';
import * as api from './api';
import { useI18n } from 'vue-i18n';

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const { t } = useI18n();

    const pageRequest = async (query: any) => {
        return await api.GetList(query);
    };
    const editRequest = async ({ form, row }: EditReq) => {
        form.id = row.id;
        return await api.UpdateObj(form);
    };
    const delRequest = async ({ row }: DelReq) => {
        return await api.DelObj(row.id);
    };
    const addRequest = async ({ form }: AddReq) => {
        return await api.AddObj(form);
    };

    return {
        crudOptions: {
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            pagination: { show: true },
            table: { show: false },
            toolbar: { compact: false },
            actionbar: {
                buttons: {
                    add: { show: true },
                },
            },
            rowHandle: {
                align: 'center',
                fixed: 'right',
                width: compute(() => 420),
                buttons: {
                    view: { show: true },
                    edit: { show: true },
                    remove: { show: true },
                },
            },
            form: {
                col: { span: 24 },
                labelWidth: '100px',
                wrapper: {
                    is: 'el-dialog',
                    width: '900px',
                },
            },
            columns: {
                _index: {
                    title: t('message.pages.taskManage.table.columns.index'),
                    form: { show: false },
                    column: {
                        type: 'index',
                        align: 'center',
                        width: '70px',
                        columnSetDisabled: true,
                    },
                },
                id: {
                    title: 'ID',
                    column: { show: false },
                    search: { show: false },
                    form: { show: false },
                },
                name: {
                    title: t('message.pages.taskManage.table.columns.name'),
                    search: { show: true },
                    column: { minWidth: 120, sortable: 'custom' },
                    form: {
                        rules: [{ required: true, message: t('message.pages.taskManage.form.validation.nameRequired') }],
                        component: { placeholder: t('message.pages.taskManage.form.namePlaceholder') },
                    },
                },
                task: {
                    title: t('message.pages.taskManage.table.columns.task'),
                    type: 'dict-select',
                    dict: dict({
                        url: '/api/dvadmin_celery/task/job_list/?limit=999',
                        value: 'label',
                        label: 'label',
                    }),
                    search: { show: true },
                    column: { minWidth: 120, sortable: 'custom', columnSetDisabled: true },
                    form: {
                        rules: [{ required: true, message: t('message.pages.taskManage.form.validation.taskRequired') }],
                        component: { placeholder: t('message.pages.taskManage.form.taskPlaceholder') },
                    },
                    valueBuilder(context: any) {
                        const { row, key } = context;
                        return row[key];
                    },
                },
                last_run_at: {
                    title: t('message.pages.taskManage.table.columns.lastRunAt'),
                    search: { show: false },
                    type: 'datetime',
                    form: { show: false },
                },
                description: {
                    title: t('message.pages.taskManage.table.columns.description'),
                    search: { show: false },
                    form: { show: false },
                },
                cron: {
                    title: t('message.pages.taskManage.table.columns.cron'),
                    search: { show: false },
                    type: 'number',
                    column: { minWidth: 90, sortable: 'custom' },
                    form: {
                        rules: [{ required: true, message: t('message.pages.taskManage.form.validation.cronRequired') }],
                        value: '1-15 1 * * *',
                    },
                },
                kwargs: {
                    title: t('message.pages.taskManage.table.columns.kwargs'),
                    search: { show: false },
                    type: 'text',
                    column: { minWidth: 90, sortable: 'custom' },
                },
                enabled: {
                    title: t('message.pages.taskManage.table.columns.status'),
                    search: { show: true },
                    type: 'dict-radio',
                    dict: dict({
                        data: [
                            {
                                label: t('message.pages.taskManage.table.columns.enabled'),
                                value: true,
                                color: 'success',
                                effect: 'dark',
                            },
                            {
                                label: t('message.pages.taskManage.table.columns.disabled'),
                                value: false,
                                effect: 'dark',
                            },
                        ],
                    }),
                },
            },
        },
    };
};
