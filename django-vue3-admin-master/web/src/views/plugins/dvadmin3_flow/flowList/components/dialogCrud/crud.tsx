import * as api from './api';
import {
    dict,
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    compute,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet
} from '@fast-crud/fast-crud';
import {request} from '/@/utils/service';
import {dictionary} from '/@/utils/dictionary';
import {successMessage} from '/@/utils/message';
import {auth} from '/@/utils/authFunction'
import {commonCrudConfig} from "/@/utils/commonCrud";
export const createCrudOptions = function ({crudExpose,context}: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const pageRequest = async (query: UserPageQuery) => {
        const id = context.value.flowInfo.id
        return await api.GetList(id,query);
    };
    const editRequest = async ({form, row}: EditReq) => {
        form.id = row.id;
        return await api.UpdateObj(form);
    };
    const delRequest = async ({row}: DelReq) => {
        return await api.DelObj(row.id);
    };
    const addRequest = async ({form}: AddReq) => {
        return await api.AddObj(form);
    };

    const exportRequest = async (query: UserPageQuery) => {
        const id = context.value.flowInfo.id
        return  api.exportData(id, query);
    };

    return {
        crudOptions: {
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            actionbar: {
                buttons: {
                    add: {
                        show: false
                    },
                    export: {
                        text: '导出', //按钮文字
                        title: '导出', //鼠标停留显示的信息
                        show: true,
                        click() {
                            return exportRequest(crudExpose!.getSearchFormData());
                        },
                    },
                }
            },
            toolbar:{
                buttons: {
                    export:{
                        show:false
                    }
                },
            },
            rowHandle: {
                show:false,
                //固定右侧
                fixed: 'right',
                width: 150,
                buttons: {
                    view: {
                        show: false,
                    },
                    edit: {
                        iconRight: 'Edit',
                        type: 'text',
                        show: auth("api_white_list:Update")
                    },
                    remove: {
                        iconRight: 'Delete',
                        type: 'text',
                        show: auth("api_white_list:Delete")
                    },
                },
            },
            form: {
                col: {span: 24},
                labelWidth: '110px',
                wrapper: {
                    is: 'el-dialog',
                    width: '600px',
                },
            },
            columns: {
                _index: {
                    title: '序号',
                    form: {show: false},
                    column: {
                        order: 0,
                        //type: 'index',
                        align: 'center',
                        width: '70px',
                        columnSetDisabled: true, //禁止在列设置中选择
                        //@ts-ignore
                        formatter: (context) => {
                            //计算序号,你可以自定义计算规则，此处为翻页累加
                            let index = context.index ?? 1;
                            let pagination: any = crudExpose!.crudBinding.value.pagination;
                            return ((pagination.currentPage ?? 1) - 1) * pagination.pageSize + index + 1;
                        },
                    },
                },
                no:{
                  title:"审批编号",
                    type:'text',
                    search:{
                        show:true
                    },
                    column:{
                        width:120,
                        order:0
                    }
                },
                status:{
                    title:'审批状态',
                    type:'dict-select',
                    search:{
                        show:true
                    },
                    dict:dict({
                        data:[
                            {value:0,label: '进行中'},
                            {value:1,label: '审核通过'},
                            {value:2,label: '审核驳回'},
                            {value:3,label: '审核撤销'},
                        ]
                    }),
                    column:{
                        width:120
                    }
                },
                ...commonCrudConfig({
                    create_datetime: {
                        search: true,
                        table: true,
                    },
                    update_datetime: {
                        table: true,
                    },
                    dept_belong_id: {
                        table: false,
                    }
                })
            },
        },
    };
};
