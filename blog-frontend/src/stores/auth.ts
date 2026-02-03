/**
 * Authentication Store
 * Manages user authentication state and tokens
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/blog'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

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

  /**
   * Login with username and password
   * Uses DVAdmin /api/login/ endpoint (JWT)
   */
  async function login(username: string, password: string) {
    try {
      // JWT endpoint returns { access: string, refresh: string }
      const response = await authClient.post<{ access: string; refresh: string }>('/login/', {
        username,
        password,
      })

      // Extract access token as the main token
      const newToken = response.data.access

      // Store token
      token.value = newToken
      localStorage.setItem('auth_token', newToken)

      // Fetch user info after successful login
      // 传入 false 避免在获取用户信息失败时跳回登录页
      await fetchUserInfo(false)

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.msg || error.response?.data?.detail || error.message
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
      // Fetch user info on init
      await fetchUserInfo()
    }
  }

  return {
    // State
    token,
    user,
    // Computed
    isLoggedIn,
    // Actions
    login,
    register,
    getUserInfo,
    fetchUserInfo,
    logout,
    initAuth,
  }
})
