import { request } from '/@/utils/service';
import { PageQuery, AddReq, DelReq, EditReq } from '@fast-crud/fast-crud';

const apiPrefix = '/api/system/celery_task/';

export function GetList(query: PageQuery) {
    return request({
        url: apiPrefix,
        method: 'get',
        params: query,
    });
}

export function GetObj(id: number) {
    return request({
        url: apiPrefix + id + '/',
        method: 'get',
    });
}

export function AddObj(obj: AddReq) {
    return request({
        url: apiPrefix,
        method: 'post',
        data: obj,
    });
}

export function UpdateObj(obj: EditReq) {
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

export function ToggleTask(id: number) {
    return request({
        url: apiPrefix + id + '/toggle/',
        method: 'post',
    });
}

export function GetIntervalSchedules() {
    return request({
        url: '/api/system/interval_schedule/',
        method: 'get',
    });
}

export function AddIntervalSchedule(data: any) {
    return request({
        url: '/api/system/interval_schedule/',
        method: 'post',
        data,
    });
}

export function GetCrontabSchedules() {
    return request({
        url: '/api/system/crontab_schedule/',
        method: 'get',
    });
}

export function AddCrontabSchedule(data: any) {
    return request({
        url: '/api/system/crontab_schedule/',
        method: 'post',
        data,
    });
}
