<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <!-- Logo/Title -->
        <div class="login-header">
          <h1 class="login-title">{{ blogTitle }}</h1>
          <p class="login-subtitle">欢迎回来</p>
        </div>

        <!-- Login Form -->
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                class="input-toggle"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="!loading">登录</span>
            <span v-else>登录中...</span>
          </button>

          <div class="login-footer">
            <span class="login-text">还没有账号？</span>
            <router-link to="/register" class="login-link">立即注册</router-link>
          </div>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const blogTitle = ref('思·录')

interface LoginForm {
  username: string
  password: string
}

const form = reactive<LoginForm>({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.username, form.password)
    
    // Show success message
    showSuccessMessage('登录成功！正在跳转...')
    
    // Redirect after short delay
    setTimeout(() => {
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
    }, 500)
  } catch (err) {
    // User-friendly error messages
    let errorMessage = '登录失败，请稍后重试'
    
    if (err instanceof Error) {
      const msg = err.message.toLowerCase()
      
      if (msg.includes('验证码')) {
        errorMessage = '验证码错误或已过期，请刷新页面重试'
      } else if (msg.includes('账号') || msg.includes('密码')) {
        errorMessage = '用户名或密码错误'
      } else if (msg.includes('锁定')) {
        errorMessage = '账号已被锁定，请联系管理员'
      } else if (msg.includes('不存在')) {
        errorMessage = '该用户不存在'
      } else {
        errorMessage = err.message
      }
    }
    
    error.value = errorMessage
  } finally {
    loading.value = false
  }
}

const showSuccessMessage = (message: string) => {
  // Create and show success toast
  const toast = document.createElement('div')
  toast.className = 'success-toast'
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 2000)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: var(--space-6);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  box-shadow: var(--shadow-md);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.login-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  margin: 0 0 var(--space-2) 0;
}

.login-subtitle {
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--ink-700);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--stone-400);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-10);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--ink-900);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.form-input:focus {
  outline: none;
  border-color: var(--vermilion);
  box-shadow: 0 0 0 3px var(--vermilion-dim);
}

.form-input::placeholder {
  color: var(--stone-400);
}

.input-toggle {
  position: absolute;
  right: var(--space-3);
  display: flex;
  align-items: center;
  padding: var(--space-1);
  background: transparent;
  border: none;
  color: var(--stone-400);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.input-toggle:hover {
  color: var(--ink-700);
}

.login-btn {
  width: 100%;
  padding: var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: white;
  background: var(--vermilion);
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.login-btn:hover:not(:disabled) {
  background: #b33827;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.login-footer {
  text-align: center;
  margin-top: var(--space-4);
}

.login-text {
  color: var(--stone-600);
  font-size: var(--font-size-sm);
}

.login-link {
  color: var(--vermilion);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.login-link:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: var(--vermilion-dim);
  border: 1px solid var(--vermilion-light);
  border-radius: var(--radius-base);
  color: #dc2626;
  font-size: var(--font-size-sm);
  text-align: center;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}
</style>
