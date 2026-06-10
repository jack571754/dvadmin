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
                title: {
                    title: '作品/文章标题',
                    type: 'input',
                    search: { show: true },
                    column: { minWidth: 150 },
                    form: {
                        rules: [{ required: true, message: '请输入作品/文章标题' }]
                    }
                },
                category: {
                    title: '类别',
                    type: 'dict-select',
                    search: { show: true },
                    dict: dict({
                        data: [
                            { label: '精选案例', value: 'case-study', color: 'success' },
                            { label: '深度思考 (Blog)', value: 'essay', color: 'primary' },
                            { label: '代码实验', value: 'experiment', color: 'warning' }
                        ]
                    }),
                    column: { minWidth: 120, align: 'center' },
                    form: {
                        rules: [{ required: true, message: '请选择类别' }]
                    }
                },
                summary: {
                    title: '摘要介绍',
                    type: 'textarea',
                    column: { minWidth: 200 },
                    form: {
                        component: {
                            type: 'textarea',
                            rows: 3
                        },
                        rules: [{ required: true, message: '请输入摘要介绍' }]
                    }
                },
                content: {
                    title: '正文/详细介绍',
                    type: 'textarea',
                    column: { show: false },
                    form: {
                        component: {
                            type: 'textarea',
                            rows: 10,
                            placeholder: '支持Markdown格式的深度长文或精选案例的体验拆解内容'
                        }
                    }
                },
                image: {
                    title: '项目图片',
                    type: 'avatar-uploader',
                    column: { minWidth: 100, align: 'center' }
                },
                demo_url: {
                    title: '演示链接',
                    type: 'input',
                    column: { minWidth: 150 },
                    form: {
                        placeholder: '例如: https://demo.example.com'
                    }
                },
                git_url: {
                    title: '源码链接',
                    type: 'input',
                    column: { minWidth: 150 },
                    form: {
                        placeholder: '例如: https://github.com/user/repo'
                    }
                },
                result_tag: {
                    title: '成果标签/量化指标',
                    type: 'input',
                    column: { minWidth: 150, align: 'center' },
                    form: {
                        placeholder: '例如: 转化率提升 35% 或 交付周期缩短 40%'
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
                is_recommend: {
                    title: '是否推荐',
                    type: 'dict-switch',
                    dict: dict({
                        data: [
                            { label: '是', value: true },
                            { label: '否', value: false }
                        ]
                    }),
                    column: { minWidth: 90, align: 'center' },
                    form: {
                        value: false
                    }
                },
                ...commonCrudConfig()
            }
        }
    };
};
