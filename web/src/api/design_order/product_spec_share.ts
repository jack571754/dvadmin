import { request } from '/@/utils/service';

const apiPrefix = '/api/design_order/product_spec_shares/';

export function CreateShareLink(submissionId: number) {
	return request({
		url: apiPrefix,
		method: 'post',
		data: { submission_id: submissionId },
	});
}

export function GetSharedSpec(shareCode: string) {
	return request({
		url: `${apiPrefix}${shareCode}/`,
		method: 'get',
	});
}

/**
 * 兜底拼分享链接。优先用后端返回的 shareUrl——它基于 FRONTEND_BASE_URL 生成，
 * 只有域名没有端口；这里的 window.location.origin 会带上访问时的端口，
 * 内网用 ip:port 打开时分享出去的链接外部访问不到。
 */
export function BuildShareUrl(shareCode: string) {
	const appBaseUrl = `${window.location.origin}${window.location.pathname}`;
	return `${appBaseUrl}#/share/product-spec/${encodeURIComponent(shareCode)}`;
}
