import { ElMessageBox } from 'element-plus';
import { i18n } from '/@/i18n/index';
import { feedback } from '/@/shared/ui/feedback';
import { Local, Session } from './storage';
import { getBaseURL } from './baseUrl';
import { sessionRevision, onSessionChanged } from '../shared/access/sessionEvents';
import { createHttpRuntime } from '../shared/api/client';
import type { ApiErrorKind } from '../shared/api/errors';

let expirationPrompt: Promise<unknown> | undefined;
// vue-i18n's path overloads recurse on template literals; the runtime lookup only needs a string key.
const translate = i18n.global.t as (key: string) => string;
const messageKey: Record<ApiErrorKind, string> = {
  network: 'networkError', timeout: 'networkTimeout', cancelled: 'requestError', auth: 'authExpired',
  forbidden: 'accessDenied', validation: 'requestError', business: 'requestError', server: 'serverError',
};

export const httpRuntime = createHttpRuntime({
  getSession: () => ({ token: Session.get('token'), revision: sessionRevision.value }),
  subscribe: onSessionChanged,
  getApiBaseURL: () => getBaseURL(),
  getOrigin: () => window.location.origin,
  getLanguage: () => {
    try { return Local.get('themeConfig')?.globalI18n || 'zh-cn'; }
    catch { return 'zh-cn'; }
  },
  expireSession: () => Session.clear(),
  notifyExpired: () => {
    if (expirationPrompt) return;
    expirationPrompt = ElMessageBox.alert(i18n.global.t('message.common.authExpired'),
      i18n.global.t('message.common.prompt'), { confirmButtonText: 'OK' })
      .catch(() => {}).finally(() => { expirationPrompt = undefined; });
  },
  // 并发失败（如页面同时发 3 个请求全断网）按错误类型合并成一次，
  // 但不同类型仍各响一次，用户能分辨是断网还是服务端出错。
  notifyError: error => { feedback({ level: 'toast', tone: 'error', text: error.message, dedupeKey: `http:${error.kind}` }); },
  message: kind => translate(`message.common.${messageKey[kind]}`),
});
