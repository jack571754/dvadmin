import qs from 'qs';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { httpRuntime } from './http';
import { getBaseURL } from './baseUrl';
import { successMessage } from './message';
import { i18n } from '/@/i18n/index';

function createService() {
    return httpRuntime.createClient({
        timeout: 20000,
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        paramsSerializer: { serialize(params) {
            const values: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(params)) {
                if (value === '') continue;
                values[key] = typeof value === 'boolean' ? (value ? 'True' : 'False') : value;
            }
            return qs.stringify(values);
        } },
    });
}

export const service = createService();
export const serviceForMock = createService();

// Keep the old envelope return type, effective timeout and dynamic tenant base URL.
function createRequestFunction(client: typeof service) {
    return (config: AxiosRequestConfig & { unpack?: boolean }) => client.request<unknown, any>({
        timeout: 5000, baseURL: getBaseURL(), data: {},
        ...config,
        headers: { 'Content-Type': 'application/json', ...config.headers },
    });
}
export const request = createRequestFunction(service);
export const requestForMock = createRequestFunction(serviceForMock);

export async function downloadFile({ url, params, method, filename = i18n.global.t('message.common.defaultExportFilename'), onTask }: {
    url: string; params?: unknown; method?: AxiosRequestConfig['method']; filename?: string; onTask?: () => void;
}) {
    const response: AxiosResponse<Blob> = await request({ url, params, method, responseType: 'blob' });
    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('/json') || contentType.includes('+json')) {
        successMessage('message.common.importTaskCreated');
        onTask?.();
        return;
    }
    const disposition = String(response.headers['content-disposition'] || '');
    const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
    const plain = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
    let downloadName = encoded || plain || `${filename}.xlsx`;
    try { downloadName = decodeURIComponent(downloadName); } catch { /* Keep the server filename if encoding is invalid. */ }
    const href = URL.createObjectURL(response.data);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = downloadName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    try { anchor.click(); } finally { anchor.remove(); URL.revokeObjectURL(href); }
}
