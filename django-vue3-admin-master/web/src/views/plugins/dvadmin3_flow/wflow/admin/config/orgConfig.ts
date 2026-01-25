import {CreateCrudOptionsProps, CreateCrudOptionsRet, dict} from "@fast-crud/fast-crud";
import request from "../../../api/request";
import XEUtils from "xe-utils"
export const detpDict = dict({
    label: 'name',
    value:'id',
    getNodesByValues:async (values) => {
        if(XEUtils.isArray(values)){
            const result = await request({
                url: '/api/system/dept/get_by_ids/',
                method: 'post',
                data: {
                    ids: values
                }
            })
            return result.data
        }else {
            return []
        }

    }
})
export const deptCurdOptions =  ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet => ({
    crudOptions:{
        request:{
            pageRequest:async (query) => {
                const result = await request({
                    url: '/api/system/dept/',
                    method: 'get',
                    params: query
                })
                return result;
            }
        },
        toolbar: { buttons: { export: { show: false } } },
        rowHandle: { show: false },
        actionbar: { buttons: { add: { show: false } } },
        columns: {
            id:{
                title:'部门ID',
                column:{
                    width:80
                }
            },
            name:{
                title:'部门名称',
                type:'text',
                search: {
                    show:true
                },
                column:{
                    minWidth:120
                }
            }
        }
    }
})


export const roleDict = dict({
    label: 'name',
    value:'id',
    getNodesByValues:async (values) => {
        if(XEUtils.isArray(values)){
            const result = await request({
                url: '/api/system/role/get_by_ids/',
                method: 'post',
                data: {
                    ids: values
                }
            })
            return result.data
        }else{
            return []
        }

    }
})
export const roleCurdOptions =  ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet => ({
    crudOptions:{
        request:{
            pageRequest:async (query) => {
                const result = await request({
                    url: '/api/system/role/',
                    method: 'get',
                    params: query
                })
                return result;
            }
        },
        toolbar: { buttons: { export: { show: false } } },
        rowHandle: { show: false },
        actionbar: { buttons: { add: { show: false } } },
        columns: {
            id:{
                title:'角色ID',
                column:{
                    width:80
                }
            },
            name:{
                title:'角色名称',
                type:'text',
                search: {
                    show:true
                },
                column:{
                    minWidth:120
                }
            }
        }
    }
})


export const userDict = dict({
    label: 'name',
    value:'id',
    getNodesByValues:async (values) => {
        const result = await request({
            url: '/api/system/user/get_by_ids/',
            method: 'post',
            data: {
                ids: values
            }
        })
        return result.data
    }
})
export const userCurdOptions =  ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet => ({
    crudOptions:{
        request:{
            pageRequest:async (query) => {
                const result = await request({
                    url: '/api/system/user/',
                    method: 'get',
                    params: query
                })
                return result;
            }
        },
        toolbar: { buttons: { export: { show: false } } },
        rowHandle: { show: false },
        actionbar: { buttons: { add: { show: false } } },
        columns: {
            id:{
                title:'用户ID',
                column:{
                    width:80
                }
            },
            name:{
                title:'用户名称',
                type:'text',
                search: {
                    show:true
                },
                column:{
                    minWidth:120
                }
            },
            mobile:{
                title:'手机号',
                type:'text',
                search: {
                    show:true
                },
                column:{
                    minWidth:120
                }
            }
        }
    }
})
