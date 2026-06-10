import { CrudOptions, AddReq, DelReq, EditReq, dict, CrudExpose, compute } from '@fast-crud/fast-crud';
import * as api from './api';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '../../../utils/message';
import { getBaseURL } from '/@/utils/baseUrl';
import { useI18n } from 'vue-i18n';

interface CreateCrudOptionsTypes {
    output: any;
    crudOptions: CrudOptions;
}

export const createCrudOptions = function ({ crudExpose }: { crudExpose: CrudExpose; }): CreateCrudOptionsTypes {
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
            pagination: {
                show: true
            },
            actionbar: {
                buttons: {
                    add: {
                        show: false
                    }
                }
            },
            toolbar: {
                buttons: {
                    export: {
                        show: false
                    }
                }
            },
            rowHandle: {
                fixed: 'right',
                width: 120,
                buttons: {
                    view: {
                        show: false
                    },
                    edit: {
                        show: false
                    },
                    remove: {
                        show: false
                    },
                    download: {
                        show: compute(ctx => ctx.row.task_status === 2),
                        text: t('message.pages.downloadCenter.buttons.downloadFile'),
                        type: 'primary',
                        click: (ctx) => window.open(getBaseURL(ctx.row.url), '_blank')
                    }
                },
            },
            form: {
                col: { span: 24 },
                labelWidth: '100px',
                wrapper: {
                    is: 'el-dialog',
                    width: '600px',
                },
            },
            columns: {
                _index: {
                    title: t('message.pages.downloadCenter.table.columns.index'),
                    form: { show: false },
                    column: {
                        type: 'index',
                        align: 'center',
                        width: '70px',
                        columnSetDisabled: true,
                    },
                },
                task_name: {
                    title: t('message.pages.downloadCenter.table.columns.taskName'),
                    type: 'text',
                    column: {
                        minWidth: 160,
                        align: 'left'
                    },
                    search: {
                        show: true
                    }
                },
                file_name: {
                    title: t('message.pages.downloadCenter.table.columns.fileName'),
                    type: 'text',
                    column: {
                        minWidth: 160,
                        align: 'left'
                    },
                    search: {
                        show: true
                    }
                },
                size: {
                    title: t('message.pages.downloadCenter.table.columns.size'),
                    type: 'number',
                    column: {
                        width: 100
                    }
                },
                task_status: {
                    title: t('message.pages.downloadCenter.table.columns.taskStatus'),
                    type: 'dict-select',
                    dict: dict({
                        data: [
                            { label: t('message.pages.downloadCenter.status.created'), value: 0 },
                            { label: t('message.pages.downloadCenter.status.processing'), value: 1 },
                            { label: t('message.pages.downloadCenter.status.completed'), value: 2 },
                            { label: t('message.pages.downloadCenter.status.failed'), value: 3 },
                        ]
                    }),
                    column: {
                        width: 120
                    },
                    search: {
                        show: true
                    }
                },
                create_datetime: {
                    title: t('message.pages.downloadCenter.table.columns.createTime'),
                    column: {
                        width: 160
                    }
                },
                update_datetime: {
                    title: t('message.pages.downloadCenter.table.columns.updateTime'),
                    column: {
                        width: 160
                    }
                }
            },
        },
    };
};
