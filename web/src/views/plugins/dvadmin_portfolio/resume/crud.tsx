import * as api from './api';
import {
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet
} from '@fast-crud/fast-crud';
import { commonCrudConfig } from "/@/utils/commonCrud";

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const pageRequest = async (query: UserPageQuery) => {
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
            rowHandle: {
                width: 140,
                buttons: {
                    view: { show: true },
                    edit: { show: true },
                    remove: { show: true }
                }
            },
            columns: {
                id: {
                    title: 'ID',
                    form: { show: false },
                    column: { width: '80px', align: 'center' }
                },
                role: {
                    title: '职位头衔',
                    type: 'input',
                    search: { show: true },
                    column: { minWidth: 150 },
                    form: {
                        rules: [{ required: true, message: '请输入职位头衔' }]
                    }
                },
                company: {
                    title: '公司/机构名称',
                    type: 'input',
                    search: { show: true },
                    column: { minWidth: 150 },
                    form: {
                        rules: [{ required: true, message: '请输入公司名称' }]
                    }
                },
                start_date: {
                    title: '开始时间',
                    type: 'input',
                    column: { minWidth: 100, align: 'center' },
                    form: {
                        rules: [{ required: true, message: '请输入开始时间' }]
                    }
                },
                end_date: {
                    title: '结束时间',
                    type: 'input',
                    column: { minWidth: 100, align: 'center' },
                    form: {
                        rules: [{ required: true, message: '请输入结束时间' }]
                    }
                },
                summary: {
                    title: '职责概述',
                    type: 'textarea',
                    column: { minWidth: 200 },
                    form: {
                        component: {
                            type: 'textarea',
                            rows: 3
                        },
                        rules: [{ required: true, message: '请输入职责概述' }]
                    }
                },
                achievements: {
                    title: '关键成就',
                    type: 'textarea',
                    column: {
                        minWidth: 250,
                        formatter: ({ value }) => {
                            if (Array.isArray(value)) {
                                return value.join('；');
                            }
                            return value;
                        }
                    },
                    form: {
                        component: {
                            type: 'textarea',
                            rows: 5,
                            placeholder: '请每行输入一条成就，系统会自动转换为要点列表进行展示'
                        },
                        valueBuilder({ value, row, key }) {
                            if (Array.isArray(value)) {
                                row[key] = value.join('\n');
                            }
                        },
                        valueResolve({ value, form, key }) {
                            if (typeof value === 'string') {
                                form[key] = value.split('\n').map(s => s.trim()).filter(Boolean);
                            }
                        }
                    }
                },
                sort: {
                    title: '排序权重',
                    type: 'number',
                    column: { minWidth: 80, align: 'center' },
                    form: {
                        value: 1
                    }
                },
                ...commonCrudConfig()
            }
        }
    };
};
