/**
 * Authentication Store
 * Manages user authentication state and tokens
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 使用代理路径，与 blog.ts 保持一致
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance for auth
import axios from 'axios'

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 为 authClient 添加请求拦截器，确保使用 JWT 认证格式
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token && config.headers) {
    config.headers.Authorization = `JWT ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export interface User {
  id: number
  username: string
  name?: string
  email?: string
  is_superuser?: boolean
  role?: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  code: number
  msg: string
  data: {
    token: string
    user?: User
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)

// Computed
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => {
    if (!user.value) return false
    return user.value.is_superuser === true || user.value.role === 'admin'
  })

  /**
   * Login with username and password
   * Uses DVAdmin /api/login/ endpoint (JWT)
   */
  async function login(username: string, password: string) {
    try {
      const response = await authClient.post('/login/', {
        username,
        password,
      })

      console.log('[Auth] Login response:', response.data)

      const responseData = response.data
      let newToken: string | null = null

      // Check for error response first
      if (responseData.code && responseData.code !== 2000) {
        throw new Error(responseData.msg || '登录失败')
      }

      // Try different response formats
      if (responseData.data?.access) {
        newToken = responseData.data.access
      } else if (responseData.access) {
        newToken = responseData.access
      }

      if (!newToken) {
        console.error('[Auth] No token in response:', responseData)
        throw new Error('登录返回数据格式错误')
      }

      // Store token
      token.value = newToken
      localStorage.setItem('auth_token', newToken)
      console.log('[Auth] Token stored successfully')

      // Fetch user info after successful login
      try {
        await fetchUserInfo(false)
        console.log('[Auth] User info fetched after login')
      } catch (error) {
        console.warn('[Auth] Failed to fetch user info after login:', error)
        // Don't throw error, user can still use the app
      }

      return responseData
    } catch (error) {
      console.error('[Auth] Login error:', error)
      if (axios.isAxiosError(error)) {
        const data = error.response?.data
        const message = data?.msg || data?.detail || error.message
        throw new Error(message)
      }
      throw error
    }
  }

  /**
   * Fetch user info from backend
   * @param redirectOnError - 是否在出错时跳转登录页（默认 true）
   */
  async function fetchUserInfo(redirectOnError: boolean = true) {
    if (!token.value) {
      return
    }

    try {
      // authClient 拦截器会自动添加 JWT 认证头
      const response = await authClient.get('/system/user/user_info/')

      console.log('[Auth] User info response:', response.data)

      if (response.data.code === 2000 || response.data.code === 200) {
        user.value = response.data.data
        console.log('[Auth] User stored:', user.value)
      } else if (response.data.code === 401) {
        // Token 无效，清除并跳转登录
        console.warn('[Auth] Token invalid, clearing and redirecting to login')
        logout()
        if (redirectOnError) {
          // 跳转到登录页
          window.location.href = '/login'
        }
      }
    } catch (error) {
      console.error('[Auth] Failed to fetch user info:', error)
      // 如果是 401 错误，清除无效 token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('[Auth] 401 error, clearing invalid token')
        logout()
        if (redirectOnError) {
          // 跳转到登录页
          window.location.href = '/login'
        }
      }
    }
  }

  /**
   * Register new user
   * Uses blog /api/blog/register/ endpoint
   */
  async function register(data: RegisterData) {
    try {
      const response = await authClient.post<AuthResponse>('/blog/register/', data)

      if (response.data.code === 2000 || response.data.code === 200) {
        return response.data
      } else {
        throw new Error(response.data.msg || '注册失败')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.msg || error.message
        throw new Error(message)
      }
      throw error
    }
  }

  /**
   * Get current user info
   * Uses DVAdmin /api/system/user/self/ endpoint
   */
  async function getUserInfo() {
    if (!token.value) {
      throw new Error('未登录')
    }

    try {
      const response = await authClient.get('/system/user/self/', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      if (response.data.code === 2000 || response.data.code === 200) {
        user.value = response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.msg || '获取用户信息失败')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.msg || error.message
        throw new Error(message)
      }
      throw error
    }
  }

  /**
   * Logout - clear token and user data
   */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  /**
   * Initialize auth state from localStorage
   */
  async function initAuth() {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
      // Fetch user info on init, but don't redirect on error
      // (token might be expired, just clear it silently)
      try {
        await fetchUserInfo(false)
      } catch (error) {
        console.warn('[Auth] Failed to fetch user info on init:', error)
        // Don't clear token here, let the user try to use the app
        // If API calls fail, they'll be redirected then
      }
    }
  }

return {
    // State
    token,
    user,
    // Computed
    isLoggedIn,
    isAdmin,
    // Actions
    login,
    register,
    getUserInfo,
    fetchUserInfo,
    logout,
    initAuth,
  }
})
