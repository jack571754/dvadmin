/**
 * Unified error handling utilities
 */

import type { AxiosError } from 'axios'

export interface ApiErrorResponse {
  code?: number
  msg?: string
  message?: string
}

/**
 * Handle API errors and return user-friendly message
 * @param error - Error object
 * @returns User-friendly error message
 */
export function handleApiError(error: any): string {
  // Axios error with response
  if (error.response) {
    const status = error.response.status
    const data = error.response.data as ApiErrorResponse

    switch (status) {
      case 400:
        return data?.msg || data?.message || '请求参数错误'
      case 401:
        return '请先登录'
      case 403:
        return '没有权限访问'
      case 404:
        return '请求的资源不存在'
      case 500:
        return '服务器错误，请稍后重试'
      case 502:
      case 503:
      case 504:
        return '服务暂时不可用，请稍后重试'
      default:
        return data?.msg || data?.message || `请求失败 (${status})`
    }
  }

  // Network error
  if (error.code === 'ERR_NETWORK') {
    return '网络连接失败，请检查网络设置'
  }

  // Timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '请求超时，请稍后重试'
  }

  // Error with message
  if (error.message) {
    return error.message
  }

  // Unknown error
  return '操作失败，请稍后重试'
}

/**
 * Show error toast/notification (placeholder for UI library integration)
 * @param message - Error message
 */
export function showError(message: string): void {
  // TODO: Integrate with UI library (e.g., Element Plus ElMessage)
  console.error('[Error]', message)

  // Fallback: alert for now
  if (typeof window !== 'undefined') {
    // Uncomment for development:
    // alert(message)
  }
}

/**
 * Show success toast/notification (placeholder for UI library integration)
 * @param message - Success message
 */
export function showSuccess(message: string): void {
  console.log('[Success]', message)

  // TODO: Integrate with UI library
  if (typeof window !== 'undefined') {
    // Uncomment for development:
    // alert(message)
  }
}
