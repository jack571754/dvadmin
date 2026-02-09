import { request } from '/@/utils/service';
import { PageQuery, DelReq } from '@fast-crud/fast-crud';

const apiPrefix = '/api/system/task_result/';

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

export function DelObj(id: DelReq) {
    return request({
        url: apiPrefix + id + '/',
        method: 'delete',
        data: { id },
    });
}
