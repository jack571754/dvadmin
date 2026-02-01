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
   * Uses DVAdmin /api/system/auth/login/ endpoint
   */
  async function login(username: string, password: string) {
    try {
      const response = await authClient.post<AuthResponse>('/system/auth/login/', {
        username,
        password,
      })

      if (response.data.code === 2000 || response.data.code === 200) {
        const { token: newToken, user: userData } = response.data.data

        // Store token
        token.value = newToken
        localStorage.setItem('auth_token', newToken)

        // Store user data if available
        if (userData) {
          user.value = userData
        }

        return response.data
      } else {
        throw new Error(response.data.msg || '登录失败')
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
  function initAuth() {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
      // Optionally fetch user info here
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
    logout,
    initAuth,
  }
})
