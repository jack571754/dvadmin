<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-box">
        <!-- Logo/Title -->
        <div class="register-header">
          <h1 class="register-title">{{ blogTitle }}</h1>
          <p class="register-subtitle">创建您的账号</p>
        </div>

        <!-- Register Form -->
        <form class="register-form" @submit.prevent="handleRegister">
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
                placeholder="请输入用户名（3-20个字符）"
                required
                minlength="3"
                maxlength="20"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">邮箱地址</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 6l-10 7L2 6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址"
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
                placeholder="请输入密码（至少6个字符）"
                required
                minlength="6"
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

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请再次输入密码"
                required
              />
              <button
                type="button"
                class="input-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg v-if="!showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

          <button type="submit" class="register-btn" :disabled="loading">
            <span v-if="!loading">注册</span>
            <span v-else>注册中...</span>
          </button>

          <div class="register-footer">
            <span class="register-text">已有账号？</span>
            <router-link to="/login" class="register-link">立即登录</router-link>
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
const showConfirmPassword = ref(false)

const blogTitle = ref('思·录')

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const form = reactive<RegisterForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  // 验证
  if (!form.username || form.username.length < 3 || form.username.length > 20) {
    error.value = '用户名长度必须在 3 到 20 个字符之间'
    return
  }

  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    error.value = '请输入正确的邮箱地址'
    return
  }

  if (!form.password || form.password.length < 6) {
    error.value = '密码长度不能少于 6 个字符'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = '两次输入密码不一致'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })
    router.push('/login')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: var(--space-6);
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  box-shadow: var(--shadow-md);
}

.register-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.register-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  margin: 0 0 var(--space-2) 0;
}

.register-subtitle {
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  margin: 0;
}

.register-form {
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background: #b33827;
  transform: translateY(-1px);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.register-footer {
  text-align: center;
  margin-top: var(--space-4);
}

.register-text {
  color: var(--stone-600);
  font-size: var(--font-size-sm);
}

.register-link {
  color: var(--vermilion);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.register-link:hover {
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
}
</style>
