import * as api from './api';
import {
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet,
    dict
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
                name: {
                    title: '姓名/标识',
                    type: 'input',
                    search: { show: true },
                    column: { minWidth: 100 },
                    form: {
                        rules: [{ required: true, message: '请输入姓名/标识' }]
                    }
                },
                avatar: {
                    title: '头像',
                    type: 'avatar-uploader',
                    column: { minWidth: 100, align: 'center' }
                },
                hero_title: {
                    title: '首屏大标题',
                    type: 'input',
                    column: { minWidth: 180 },
                    form: {
                        rules: [{ required: true, message: '请输入首屏大标题' }]
                    }
                },
                hero_role: {
                    title: '职业头衔',
                    type: 'input',
                    column: { minWidth: 150 },
                    form: {
                        rules: [{ required: true, message: '请输入职业头衔' }]
                    }
                },
                hero_bio: {
                    title: '个人简介',
                    type: 'textarea',
                    column: { minWidth: 200 },
                    form: {
                        component: {
                            type: 'textarea',
                            rows: 3
                        },
                        rules: [{ required: true, message: '请输入个人简介' }]
                    }
                },
                email: {
                    title: '联络邮箱',
                    type: 'input',
                    column: { minWidth: 150 },
                    form: {
                        rules: [
                            { required: true, message: '请输入联络邮箱' },
                            { type: 'email', message: '请输入正确的邮箱格式' }
                        ]
                    }
                },
                social_proof: {
                    title: '量化证明/社会信誉',
                    type: 'input',
                    column: { minWidth: 200 },
                    form: {
                        placeholder: "例如: 已交付 50+ 个项目 | 合作过金融、电商领域客户"
                    }
                },
                is_active: {
                    title: '是否启用',
                    type: 'dict-switch',
                    dict: dict({
                        data: [
                            { label: '是', value: true },
                            { label: '否', value: false }
                        ]
                    }),
                    column: { minWidth: 90, align: 'center' },
                    form: {
                        value: true
                    }
                },
                ...commonCrudConfig()
            }
        }
    };
};
