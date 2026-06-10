import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { useI18n } from 'vue-i18n';

export const createCrudOptions = function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const { t } = useI18n();

    const pageRequest = async (query: UserPageQuery) => {
        const taskItemName = context?.taskItem?.name;
        if (taskItemName) {
            query.periodic_task_name = taskItemName;
        }
        return await api.GetList({ ...query });
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
            actionbar: {
                show: false,
            },
            toolbar: {
                show: false,
            },
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            rowHandle: {
                show: false,
            },
            form: {
                col: { span: 24 },
                labelWidth: '110px',
                wrapper: {
                    is: 'el-dialog',
                    width: '600px',
                },
            },
            columns: {
                _index: {
                    title: t('message.pages.taskLog.table.columns.index'),
                    form: { show: false },
                    column: {
                        align: 'center',
                        width: '60px',
                        columnSetDisabled: true,
                        formatter: (context: any) => {
                            let index = context.index ?? 1;
                            let pagination: any = crudExpose!.crudBinding.value.pagination;
                            return ((pagination.currentPage ?? 1) - 1) * pagination.pageSize + index + 1;
                        },
                    },
                },
                task_id: {
                    title: t('message.pages.taskLog.table.columns.taskId'),
                    search: { show: true },
                    column: { width: 200 },
                    type: 'text',
                },
                task_name: {
                    title: t('message.pages.taskLog.table.columns.taskName'),
                    search: { show: true },
                    column: { minWidth: 200 },
                    type: 'text',
                },
                periodic_task_name: {
                    title: t('message.pages.taskLog.table.columns.periodicTaskName'),
                    search: { show: false },
                    column: { width: 200 },
                    type: 'text',
                },
                task_kwargs: {
                    title: t('message.pages.taskLog.table.columns.taskKwargs'),
                    search: { show: false },
                    column: { width: 120 },
                    type: 'text',
                },
                status: {
                    title: t('message.pages.taskLog.table.columns.status'),
                    search: { show: true },
                    type: 'dict-select',
                    column: { width: 100 },
                    dict: dict({
                        data: [
                            {
                                label: t('message.pages.taskLog.status.SUCCESS'),
                                value: 'SUCCESS',
                                color: 'success',
                                effect: 'dark',
                            },
                            {
                                label: t('message.pages.taskLog.status.STARTED'),
                                value: 'STARTED',
                                effect: 'dark',
                            },
                            {
                                label: t('message.pages.taskLog.status.REVOKED'),
                                value: 'REVOKED',
                                effect: 'dark',
                            },
                            {
                                label: t('message.pages.taskLog.status.RETRY'),
                                value: 'RETRY',
                                effect: 'dark',
                            },
                            {
                                label: t('message.pages.taskLog.status.RECEIVED'),
                                value: 'RECEIVED',
                                effect: 'dark',
                            },
                            {
                                label: t('message.pages.taskLog.status.PENDING'),
                                value: 'PENDING',
                                effect: 'dark',
                            },
                            {
                                label: t('message.pages.taskLog.status.FAILURE'),
                                value: 'FAILURE',
                                effect: 'dark',
                                color: 'error',
                            },
                        ],
                    }),
                },
                result: {
                    title: t('message.pages.taskLog.table.columns.result'),
                    search: { show: false },
                    column: { width: 120 },
                    type: 'text',
                },
                date_done: {
                    title: t('message.pages.taskLog.table.columns.dateDone'),
                    type: 'datetime',
                    search: { show: false },
                    column: { width: 160 },
                    form: { show: false },
                    viewForm: { show: true },
                },
                date_created: {
                    title: t('message.pages.taskLog.table.columns.dateCreated'),
                    type: 'datetime',
                    search: { show: false },
                    column: { width: 160 },
                    form: { show: false },
                    viewForm: { show: true },
                },
            },
        },
    };
};
