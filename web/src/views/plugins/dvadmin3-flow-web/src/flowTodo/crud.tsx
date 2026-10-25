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

export const createCrudOptions = function ({crudExpose}: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const pageRequest = async (query: UserPageQuery) => {
        return await api.GetList(query);
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
                    }
                }
            },
            rowHandle: {
                //固定右侧
                fixed: 'right',
                width: 80,
                buttons: {
                    view: {
                        show: false,
                    },
                    edit: {
                        iconRight: 'Edit',
                        type: 'text',
                        show:false
                    },
                    remove: {
                        iconRight: 'Delete',
                        type: 'text',
                        show:false
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
                    title:"流水号",
                    search: {
                        show: true,
                        component: {
                            props: {
                                clearable: true,
                            },
                            placeholder: '请输入',
                        },
                    },
                    column: {
                        width: '160px',
                        align: 'center'
                    }
                },
                name:{
                    title:'名称',
                    column: {
                        width: '250px',
                        align: 'center'
                    }
                },
                models_name:{
                    title:'库表',
                    column: {
                        width: '140px',
                        align: 'center'
                    }
                },
                start_user_name:{
                    title:'发起人',
                    type:'text',
                    column: {
                        width: '120px',
                        align: 'center'
                    },
                    search:{
                        show:true
                    }
                },
                "current_node.name":{
                    title:'当前节点',
                    column: {
                        width: '160px',
                        align: 'center'
                    }
                },
                pre_user:{
                    title:"预处理人",
                    type:'text',
                    column: {
                        width: '160px',
                        align: 'center',
                        formatter({value,row,index}){
                            return value.map((item)=>{
                                return item.name + " "
                            })
                        }
                    },
                    search:{
                        show:true
                    }
                },
                pre_role:{
                    title:"预处理角色",
                    type:'text',
                    column: {
                        width: '160px',
                        align: 'center',
                        formatter({value,row,index}){
                            return value.map((item)=>{
                                return item.name + " "
                            })
                        }
                    },
                    search:{
                        show:true
                    }
                },
                pre_dept:{
                    title:"预处理部门",
                    type:'text',
                    column: {
                        width: '160px',
                        align: 'center',
                        formatter({value,row,index}){
                            return value.map((item)=>{
                                return item.name + " "
                            })
                        }
                    },
                    search:{
                        show:true
                    }
                },
                status:{
                    title:'状态',
                    type:'dict-select',
                    column: {
                        fixed: 'right',
                        width: '100px',
                        align: 'center'
                    },
                    dict:dict({data:[
                            {value:0,label: '进行中'},
                            {value:1,label: '审核通过'},
                            {value:2,label: '审核驳回'},
                            {value:3,label: '审核撤销'},
                        ]})
                },
				...commonCrudConfig({
                    create_datetime: {
                        search: false,
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
