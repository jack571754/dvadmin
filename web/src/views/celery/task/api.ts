import { request } from '/@/utils/service';
import { AddReq, DelReq, EditReq, InfoReq, PageQuery } from '@fast-crud/fast-crud';

export const apiPrefix = '/api/dvadmin_celery/task/';

export function GetList(query: PageQuery) {
    return request({
        url: apiPrefix,
        method: 'get',
        params: query,
    });
}

export function GetObj(id: InfoReq) {
    return request({
        url: apiPrefix + id,
        method: 'get',
    });
}

export function AddObj(obj: AddReq) {
    if (obj.kwargs) {
        obj.kwargs = JSON.stringify(obj.kwargs);
    }
    return request({
        url: apiPrefix,
        method: 'post',
        data: obj,
    });
}

export function UpdateObj(obj: EditReq) {
    if (obj.kwargs) {
        obj.kwargs = JSON.stringify(obj.kwargs);
    }
    return request({
        url: apiPrefix + obj.id + '/',
        method: 'put',
        data: obj,
    });
}

export function DelObj(id: DelReq) {
    return request({
        url: apiPrefix + id + '/',
        method: 'delete',
        data: { id },
    });
}

export function UpdateTask(obj: EditReq) {
    return request({
        url: apiPrefix + obj.id + '/update_status/',
        method: 'post',
        data: obj,
    });
}

export function RunTask(obj: AddReq) {
    return request({
        url: apiPrefix + obj.id + '/run_task/',
        method: 'post',
        data: obj,
    });
}
